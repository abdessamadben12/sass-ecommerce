<?php

namespace App\Services;

use Exception;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;


class TicketService
{
   
    public function deleteMessage(int $id)
    { 
        try{
            $message=TicketReply::findOrFail($id);
        $attachments=$message->attachments;
        if($attachments){
            foreach($attachments as $index => $attachment){
            $path=str_replace("//","/",$attachments[$index]["path"]);
            $file=Storage::exists($path);
            if($file){
                Storage::delete($path,$attachments[$index]["name"]);
            }
        }
        }
        $message->delete();
        return ["message"=>"Message deleted successfully"];

        }catch(Exception $e){
           return $e->getMessage();
        }
        }

  
}