<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateProductsRequest extends FormRequest
{
    public function authorize()
    {
        // return auth()->check() && auth()->user()->shop !== null;
        return false;

    }

    public function rules(): array
    {
        return [
            'product_ids' => ['required', 'array', 'min:1', 'max:100'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'data' => ['required', 'array'],
            'data.status' => [
                'sometimes', 
                Rule::in(['draft', 'pending', 'approved', 'rejected', 'suspended'])
            ],
            'data.license_id' => ['sometimes', 'integer', 'exists:licenses,id'],
            'data.base_price' => ['sometimes', 'numeric', 'min:0', 'max:999999.99'],
            'data.category_id' => ['sometimes', 'integer', 'exists:categories,id']
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = auth()->user();
            
            // Check if user owns all selected products (if not admin)
            if (!$user->hasRole(['admin', 'moderator'])) {
                $userProductIds = $user->shop->products()->pluck('id')->toArray();
                $invalidIds = array_diff($this->product_ids, $userProductIds);
                
                if (!empty($invalidIds)) {
                    $validator->errors()->add('product_ids', 'You can only update your own products.');
                }
            }
            
            // Check status change permissions
            if (isset($this->data['status'])) {
                $status = $this->data['status'];
                if (in_array($status, ['approved', 'rejected', 'suspended'])) {
                    if (!$user->hasRole(['admin', 'moderator'])) {
                        $validator->errors()->add('data.status', 'You do not have permission to change status to ' . $status);
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'product_ids.required' => 'Please select at least one product.',
            'product_ids.max' => 'You can update maximum 100 products at once.',
            'product_ids.*.exists' => 'One or more selected products do not exist.',
            'data.required' => 'Please provide data to update.',
            'data.status.in' => 'Invalid status selected.',
            'data.license_id.exists' => 'Selected license does not exist.',
            'data.base_price.numeric' => 'Base price must be a valid number.',
            'data.base_price.min' => 'Base price cannot be negative.',
            'data.base_price.max' => 'Base price cannot exceed 999,999.99.',
            'data.category_id.exists' => 'Selected category does not exist.'
        ];
    }
}
