<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('id');
        return [
            
        'first_name' => 'string|max:255',
        'last_name'  => 'string|max:255',
        'email'      => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
        'mobile'     => 'nullable|string|max:20',
        'address'    => 'nullable|string|max:255',
        'city'       => 'nullable|string|max:100',
        'state'      => 'nullable|string|max:100',
        'zip'   => 'nullable|string|max:20',
        'country'    => 'nullable|string|max:100',
        'status'     => 'nullable|in:active,pending,inactive',
        'verified_email' => 'boolean',
        'twoFA'         => 'boolean',
    ];
    }
}
