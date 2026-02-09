<?php

namespace App\Http\Controllers;

use App\Mail\MarketingEmail;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MarketingEmailController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'subject' => 'required|string|max:150',
            'content' => 'required|string',
            'target' => 'required|in:subscribers,users,all_users',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
            'subscriber_emails' => 'nullable|array',
            'subscriber_emails.*' => 'email',
        ]);

        if ($data['target'] === 'users' && empty($data['user_ids'])) {
            return response()->json([
                'message' => 'user_ids is required when target is users.'
            ], 422);
        }

        $subject = $data['subject'];
        $content = $data['content'];

        $query = match ($data['target']) {
            'subscribers' => !empty($data['subscriber_emails'])
                ? Subscriber::query()->select('email')->whereIn('email', $data['subscriber_emails'])
                : Subscriber::query()->select('email'),
            'users' => User::query()->select('email')->whereIn('id', $data['user_ids']),
            'all_users' => User::query()->select('email'),
        };

        $sent = 0;
        $query->chunk(200, function ($rows) use ($subject, $content, &$sent) {
            foreach ($rows as $row) {
                Mail::to($row->email)->send(new MarketingEmail($subject, $content));
                $sent++;
            }
        });

        return response()->json([
            'message' => 'Marketing email sent',
            'sent' => $sent,
        ]);
    }
}
