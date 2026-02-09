<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\NotificationMail;

class NotificationController extends Controller
{
    public function getNotifications(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $search = $request->input('search');
        $status = $request->input('status');
        $userId = $request->input('user_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Notification::query()->with('user')->orderBy('created_at', 'desc');
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }
        if ($status === 'read') {
            $query->where('is_read', true);
        }
        if ($status === 'unread') {
            $query->where('is_read', false);
        }
        if (!empty($userId)) {
            $query->where('user_id', $userId);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $notifications = $query->paginate($perPage);
        foreach ($notifications as $notification) {
            $notification->time = $notification->created_at->diffForHumans(now());
        }

        return response()->json($notifications);
    }

    public function show(Notification $notification)
    {
        $notification->load('user');
        $notification->time = $notification->created_at->diffForHumans(now());
        return response()->json($notification);
    }

    public function markRead(Notification $notification)
    {
        $notification->update(['is_read' => true]);
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllRead()
    {
        Notification::where('is_read', false)->update(['is_read' => true]);
        return response()->json(['message' => 'All notifications marked as read']);
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
