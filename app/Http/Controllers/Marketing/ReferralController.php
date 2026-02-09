<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Models\ReferralCode;
use App\Models\ReferralInvite;
use App\Models\ReferralReward;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function codes(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $query = ReferralCode::query()->with('user')->latest();
        return response()->json($query->paginate($perPage));
    }

    public function createCode(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string|max:50|unique:referral_codes,code',
            'reward_type' => 'required|in:credit,percent,fixed',
            'reward_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
        ]);

        $code = ReferralCode::create($data);
        return response()->json($code, 201);
    }

    public function invites(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $query = ReferralInvite::query()->latest();
        return response()->json($query->paginate($perPage));
    }

    public function rewards(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $query = ReferralReward::query()->latest();
        return response()->json($query->paginate($perPage));
    }
}
