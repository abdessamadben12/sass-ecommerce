<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NotificationController extends Controller
{
    public function getNotifications(Request $request)
    {
        $notifications=Notification::all();
      foreach ($notifications as $notification) {
        $notification->time = $notification->created_at->diffForHumans(now());
}
        return response()->json($notifications);
    }
    public function sendNotification(Request $request)
    {
        $validate=$request->validate([
            "title"=>"required|string",
            "message"=>"required|string",
            "user_id"=>"array"
        ]);
        if($request->type=="all"){
            $users=User::all();
            foreach($users as $user){
              //  create maill to user
              Mail::to($user->email)->send(new NotificationMail($validate));
            }
        }
        $notification=Notification::create($validate);
        return response()->json(["message"=>"Notification sent successfully"], 200);
    }
}
