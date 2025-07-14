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
}
