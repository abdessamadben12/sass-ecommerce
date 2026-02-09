<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $query = Campaign::query()->latest();

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
            'type' => 'required|in:email,banner,push,sms',
            'subject' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'status' => 'required|in:draft,scheduled,sending,sent,paused',
            'scheduled_at' => 'nullable|date',
            'target_type' => 'required|in:subscribers,users,all_users',
            'filters' => 'nullable|array',
        ]);

        $data['created_by'] = $request->user()?->id;

        $campaign = Campaign::create($data);

        return response()->json($campaign, 201);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:email,banner,push,sms',
            'subject' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,scheduled,sending,sent,paused',
            'scheduled_at' => 'nullable|date',
            'target_type' => 'sometimes|required|in:subscribers,users,all_users',
            'filters' => 'nullable|array',
        ]);

        $campaign->update($data);

        return response()->json($campaign);
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();
        return response()->json(['deleted' => true]);
    }
}
