<?php

namespace App\Http\Requests;

use App\Models\ProductSetting;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // return auth()->check() && auth()->user()->shop !== null;
        return true;   
    }

    public function rules(): array
    {
        // return [
        //     'category_id' => ['required', 'integer', 'exists:categories,id'],
        //     'format_id' => ['nullable', 'integer', 'exists:product_formats,id'],
        //     'license_id' => ['required', 'integer', 'exists:licenses,id'],
        //     'title' => ['required', 'string', 'max:255', 'min:3'],
        //     'description' => ['nullable', 'string', 'max:10000'],
        //     'tags' => ['nullable', 'array', 'max:20'],
        //     'tags.*' => ['string', 'max:50'],
        //     'base_price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        //     'minimum_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
        //     'meta_title' => ['nullable', 'string', 'max:60'],
        //     'meta_description' => ['nullable', 'string', 'max:160']
        // ];
        return [];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Check if product setting exists for category/format combination
            $productSetting = ProductSetting::where('category_id', $this->category_id)
                ->when($this->format_id, function ($query) {
                    return $query->where('format_id', $this->format_id);
                })
                ->first();

            if (!$productSetting) {
                $validator->errors()->add('category_id', 'No product settings found for this category and format combination.');
            }

            // Validate minimum price against base price
            if ($this->minimum_price && $this->base_price && $this->minimum_price > $this->base_price) {
                $validator->errors()->add('minimum_price', 'Minimum price cannot be greater than base price.');
            }

            // Validate description length if product setting exists
            if ($productSetting && $this->description) {
                if (!$productSetting->validateDescription($this->description)) {
                    $validator->errors()->add('description', "Description must be at least {$productSetting->requires_description_min_length} characters long.");
                }
            }

            // Validate tags count if product setting exists
            if ($productSetting && $this->tags) {
                if (!$productSetting->validateTags($this->tags)) {
                    $validator->errors()->add('tags', "At least {$productSetting->requires_tags_min_count} tags are required.");
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'Selected category does not exist.',
            'license_id.required' => 'Please select a license.',
            'license_id.exists' => 'Selected license does not exist.',
            'title.required' => 'Product title is required.',
            'title.min' => 'Product title must be at least 3 characters.',
            'title.max' => 'Product title cannot exceed 255 characters.',
            'base_price.required' => 'Base price is required.',
            'base_price.numeric' => 'Base price must be a valid number.',
            'base_price.min' => 'Base price cannot be negative.',
            'base_price.max' => 'Base price cannot exceed 999,999.99.',
            'tags.max' => 'You can add maximum 20 tags.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
            'meta_title.max' => 'Meta title cannot exceed 60 characters.',
            'meta_description.max' => 'Meta description cannot exceed 160 characters.'
        ];
    }

    protected function prepareForValidation(): void
    {
        // Clean and prepare tags
        if ($this->tags) {
            $this->merge([
                'tags' => array_unique(array_filter(array_map('trim', $this->tags)))
            ]);
        }

        // Ensure minimum_price is not higher than base_price
        if ($this->minimum_price && $this->base_price && $this->minimum_price > $this->base_price) {
            $this->merge(['minimum_price' => $this->base_price]);
        }
    }
}
