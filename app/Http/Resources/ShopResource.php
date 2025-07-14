<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return  [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description,
            'image' => $this->image,
            'status' => $this->status,
            'created_at' =>Carbon::parse($this->created_at)->format("d/m/y H:m"),

            // Données calculées
            'total_profits' => $this->total_profits ?? 0,
            'total_orders' => $this->total_orders ?? 0,
            'products_count' => $this->products_count ?? 0,
            'profits_sum_total_amount' => $this->profits_sum_total_amount ?? 0,
            "products_active_count" => $this->products->where('status', 'active')->count(),
            'user' => $this->whenLoaded('user',function($user){
                return [
                    'name'=>$this->user->name,
                    'email' => $this->user->email,
                    'phone' => $this->user->details->phone ?? "",
                    'country' => $this->user->details->country ?? "",
                    'city' => $this->user->details->city ?? "",
                    'address' => $this->user->details->address ?? "",
                    'status' => $this->user->status ,
                ];
                })
        ];
    }
    
}
