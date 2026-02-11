<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;
    public $fillable = ['title', 'description', 'priority', 'status', 'user_id', 'assigned_to', 'attachments'];
    protected $table = 'tickets';
    protected $casts = [
        'attachments' => 'array',
        
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
    public function messageReplay(){
        return $this->hasMany(TicketReply::class,"ticket_id");
    }
}
