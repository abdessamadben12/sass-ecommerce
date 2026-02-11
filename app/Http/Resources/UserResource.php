<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
       return [
            "id" => $this->id,
            "name" => $this->name,
            "verfied_email"=>$this->email_verified_at ? true : false,
            "email" => $this->email,
            "twoFA"=>$this->is_2fa_enabled,
            "first_name" => $this->details->first_name ?? "not eny",
            "last_name" => $this->details->last_name ?? "not entry",
            "mobile" => $this->details->phone ?? "not entry",
                "address" => $this->details->address ?? "not entry",
                "city" => $this->details->city ?? "not eny",
                "state" => $this->details->state ?? "not entry",
                "zipCode" => $this->details->zip ?? "not entry",
                "country" => $this->details->country ?? "not entry",
            "image" => $this->details->image ?? "not entry",
            "balance" => number_format($this->balance->balance,2,".",",") ?? 0,
            "withdrawals_sum" => number_format($this->withdrawals_sum_amount,2,".",",") ?? 0,
            "deposits_sum" => $this->deposits_sum_amount ?? 0,
            "transactions_sum" => number_format($this->transactions_sum_amount,2,".",",") ?? 0,
            "total_profit" => number_format($this->profit_sum_total_amount,2,".",",") ?? 0,
            "orders_count" => $this->orders_count ?? 0,
            "products_count" => $this->products_count ?? 0,

           
            "orders" => $this->orders,
            "deposits" => $this->deposits,
            "withdrawals" => $this->withdrawals,
            "transactions" => $this->transactions,

            "shops" => $this->shops->map(function ($shop) {
                return [
                    "id" => $shop->id,
                    "name" => $shop->name,
                    "description" => $shop->description,
                    "products" => $shop->products,
                ];
            }),
        ];
    }
}
