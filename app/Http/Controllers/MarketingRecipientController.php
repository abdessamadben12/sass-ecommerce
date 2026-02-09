<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Http\Request;

class MarketingRecipientController extends Controller
{
    public function search(Request $request)
    {
        $data = $request->validate([
            'q' => 'nullable|string',
            'type' => 'required|in:subscribers,users',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $query = $data['q'] ?? '';
        $limit = $data['limit'] ?? 10;

        if ($data['type'] === 'subscribers') {
            $rows = Subscriber::query()
                ->select('email')
                ->when($query !== '', fn($q) => $q->where('email', 'like', "%{$query}%"))
                ->orderBy('email')
                ->limit($limit)
                ->get();

            return response()->json([
                'items' => $rows->map(fn($r) => [
                    'type' => 'subscriber',
                    'email' => $r->email,
                ])
            ]);
        }

        $rows = User::query()
            ->select('id', 'email')
            ->when($query !== '', fn($q) => $q->where('email', 'like', "%{$query}%"))
            ->orderBy('email')
            ->limit($limit)
            ->get();

        return response()->json([
            'items' => $rows->map(fn($r) => [
                'type' => 'user',
                'id' => $r->id,
                'email' => $r->email,
            ])
        ]);
    }
}
