<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;
     protected $fillable = [
        'user_id', 'order_id', 'invoice_number', 'issue_date',
        'due_date', 'currency', 'subtotal', 'tax_amount', 'total_amount',
        'status', 'pdf_path'
    ];

    public function items() {
        return $this->hasMany(InvoiceItem::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function payments() {
        return $this->hasMany(Payment::class);
    }
}
