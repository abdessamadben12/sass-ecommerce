<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $query = Promotion::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:event,launch,banner,featured',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'target_url' => 'nullable|string',
            'status' => 'required|in:draft,scheduled,active,paused,ended',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'priority' => 'nullable|integer|min:0',
        ]);

        $data['created_by'] = $request->user()?->id;

        $promotion = Promotion::create($data);

        return response()->json($promotion, 201);
    }

    public function update(Request $request, Promotion $promotion)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:event,launch,banner,featured',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'target_url' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,scheduled,active,paused,ended',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'priority' => 'nullable|integer|min:0',
        ]);

        $promotion->update($data);

        return response()->json($promotion);
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();
        return response()->json(['deleted' => true]);
    }
}
