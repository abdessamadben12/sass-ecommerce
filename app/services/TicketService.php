<?php

namespace App\Services;

use Exception;
use App\Models\TicketReply;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;


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
            $disk = Storage::disk("spaces_2");
            if($disk->exists($path)){
                $disk->delete($path);
            }
        }
        }
        $message->delete();
        return ["ok" => true, "message"=>"Message deleted successfully"];

        } catch (ModelNotFoundException $e) {
           return ["ok" => false, "message" => "Message not found", "status" => 404];
        }catch(Exception $e){
           return ["ok" => false, "message"=>"Failed to delete message", "status" => 500];
        }
        }

  
}
