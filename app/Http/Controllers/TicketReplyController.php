<?php

namespace App\Http\Controllers;

use App\Models\TicketReply;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\TicketService;
use Illuminate\Support\Facades\Storage;

class TicketReplyController extends Controller
{
   
    public function create(Request $request){
        $request->validate([
            "user_id"=>"required|exists:users,id",
            "ticket_id"=>"required|exists:tickets,id",
            "message"=>"required",
        ]);
        $attachments=[];
        if($request->hasFile("attachments")){
            foreach($request->file("attachments") as $file){
                $path=Storage::disk("spaces_2")->put("tickets/",$file);
                $originName=$file->getClientOriginalName();
                $type=mime_content_type( $file->getPathname());
                $attachments[]=[
                    "path"=>$path,
                    "name"=>$originName,
                    "type"=>$type
                ];
            }
        }
        TicketReply::create([
            "ticket_id"=>$request->ticket_id,
            "user_id"=>$request->user_id,
            "message"=>$request->message,
            "attachments"=>$attachments
        ]);
    }
    public function deleteMessage(Request $request){
        $id=$request->id;
        $newMessage=new TicketService();
         $res=$newMessage->deleteMessage($id);
        return response()->json($res);
    }

}
