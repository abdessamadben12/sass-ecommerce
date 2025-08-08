<?php

namespace App\Http\Requests;

use App\Models\ProductSetting;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');
        // return auth()->check() && 
            //    auth()->user()->shop !== null && 
            //    $product->shop_id === auth()->user()->shop->id;
            return false;
    }

    public function rules(): array
    {
        $product = $this->route('product');
        
        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'format_id' => ['nullable', 'integer', 'exists:product_formats,id'],
            'license_id' => ['sometimes', 'integer', 'exists:licenses,id'],
            'title' => ['sometimes', 'string', 'max:255', 'min:3'],
            'description' => ['nullable', 'string', 'max:10000'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:50'],
            'base_price' => ['sometimes', 'numeric', 'min:0', 'max:999999.99'],
            'minimum_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'meta_title' => ['nullable', 'string', 'max:60'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'status' => [
                'sometimes', 
                Rule::in(['draft', 'pending', 'approved', 'rejected', 'suspended'])
            ]
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $product = $this->route('product');
            
            // Only allow status changes in certain conditions
            if ($this->has('status')) {
                $currentStatus = $product->status;
                $newStatus = $this->status;
                
                // Draft can go to pending
                if ($currentStatus === 'draft' && $newStatus !== 'pending' && $newStatus !== 'draft') {
                    $validator->errors()->add('status', 'Draft products can only be submitted for review.');
                }
                
                // Approved products can only be suspended
                if ($currentStatus === 'approved' && !in_array($newStatus, ['approved', 'suspended'])) {
                    $validator->errors()->add('status', 'Approved products can only be suspended.');
                }
                
                // Only admin/moderator can approve/reject/suspend
                if (in_array($newStatus, ['approved', 'rejected', 'suspended'])) {
                    if (!auth()->user()->hasRole(['admin', 'moderator'])) {
                        $validator->errors()->add('status', 'You do not have permission to change status to ' . $newStatus);
                    }
                }
            }

            // Check if product setting exists for new category/format combination
            if ($this->has('category_id')) {
                $categoryId = $this->category_id;
                $formatId = $this->format_id ?? $product->productSetting->format_id;
                
                $productSetting = ProductSetting::where('category_id', $categoryId)
                    ->when($formatId, function ($query) use ($formatId) {
                        return $query->where('format_id', $formatId);
                    })
                    ->first();

                if (!$productSetting) {
                    $validator->errors()->add('category_id', 'No product settings found for this category and format combination.');
                }
            }

            // Validate minimum price against base price
            $basePrice = $this->base_price ?? $product->base_price;
            $minimumPrice = $this->minimum_price;
            
            if ($minimumPrice && $basePrice && $minimumPrice > $basePrice) {
                $validator->errors()->add('minimum_price', 'Minimum price cannot be greater than base price.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Selected category does not exist.',
            'license_id.exists' => 'Selected license does not exist.',
            'title.min' => 'Product title must be at least 3 characters.',
            'title.max' => 'Product title cannot exceed 255 characters.',
            'base_price.numeric' => 'Base price must be a valid number.',
            'base_price.min' => 'Base price cannot be negative.',
            'base_price.max' => 'Base price cannot exceed 999,999.99.',
            'tags.max' => 'You can add maximum 20 tags.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
            'meta_title.max' => 'Meta title cannot exceed 60 characters.',
            'meta_description.max' => 'Meta description cannot exceed 160 characters.',
            'status.in' => 'Invalid status selected.'
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
    }
}