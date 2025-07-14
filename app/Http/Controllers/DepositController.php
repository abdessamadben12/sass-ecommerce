<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DepositController extends Controller
{
    public function getDeposits(Request $request)
    {
        $status= $request->input('status', 'all');
        $startDate = $request->input('start_date', null);
        $endDate = $request->input('end_date', null);
        $userId = $request->input('user_id', null);
        $query = Deposit::query();
        if ($request->has('user_id') && $userId !== null) {
            $query->where('user_id', $userId);
        }
        if($startDate !== null && $endDate !== null) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate !== null) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate !== null) {
            $query->where('created_at', '<=', $endDate);
        }
        if($status === 'pending') {
            $query->whereNull('confirmed_at');
        } elseif ($status === 'confirmed') {
            $query->whereNotNull('confirmed_at');
        } elseif ($status === 'rejected') {
            $query->where('status', 'rejected');
        }
        $depost= $query->with(['user', 'transaction'])->get();
        return response()->json($depost);
    }
    
}
