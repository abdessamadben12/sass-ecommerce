<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscribersController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'q' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = trim((string) ($data['q'] ?? ''));
        $perPage = (int) ($data['per_page'] ?? 10);

        $rows = Subscriber::query()
            ->when($query !== '', fn($q) => $q->where('email', 'like', "%{$query}%"))
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'subscribers' => $rows,
            'total' => Subscriber::count(),
        ]);
    }
}

