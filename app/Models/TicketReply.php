<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketReply extends Model
{
    use HasFactory;
    protected $fillable=[
        'ticket_id',
        'message',
        'user_id',
        "attachments"
    ];
    public $casts=[
        "attachments"=>"array"
    ];
    public function user(){
        return $this->belongsTo(User::class,"user_id");
    }
    public function ticket(){
        return $this->belongsTo(Ticket::class,"ticket_id");
    }
}
