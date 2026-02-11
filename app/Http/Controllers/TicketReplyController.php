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
            "ticket_id"=>"required|exists:tickets,id",
            "message"=>"required|string",
            "user_id"=>"nullable|exists:users,id",
        ]);
        $userId = $request->user()?->id ?? $request->input("user_id");
        if (!$userId) {
            return response()->json(["message" => "User not found"], 422);
        }
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
            "user_id"=>$userId,
            "message"=>$request->message,
            "attachments"=>$attachments
        ]);
        return response()->json(["message"=>"Reply sent successfully"], 201);
    }
    public function deleteMessage($id){
        $newMessage=new TicketService();
        $res=$newMessage->deleteMessage((int)$id);
        if (!($res['ok'] ?? false)) {
            return response()->json(['message' => $res['message'] ?? 'Failed to delete message'], $res['status'] ?? 500);
        }
        return response()->json(['message' => $res['message'] ?? 'Message deleted successfully'], 200);
    }

}
