<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TransactionController extends Controller
{
public function getTransactions(Request $request ){
    $status= $request->status;
    $startDate = $request->input('start_date') !== null ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
    $endDate = $request->input('end_date') !== null ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
    $trxOrName = $request->input('search', null);
    $perPage = $request->input('per_page', 10);
    $query = Transaction::query();  
    if ($trxOrName !== null) {
        $query->whereHas('user', function ($q) use ($trxOrName) {
            $q->where('name', 'like', '%' . $trxOrName . '%');
        })->orWhere('transaction_id', 'like', '%' . $trxOrName . '%');
    }
    if ($startDate !== null && $endDate !== null) {
        $query->whereBetween('created_at', [$startDate, $endDate]);
    } elseif ($startDate !== null) {
        $query->where('created_at', '>=', $startDate);
    } elseif ($endDate !== null) {
        $query->where('created_at', '<=', $endDate);
    }
    if ($status === 'pending') {
        $query->whereNull('confirmed_at');
    } elseif ($status === 'confirmed') {
        $query->whereNotNull('confirmed_at');
    } elseif ($status === 'rejected') {
        $query->where('status', 'rejected');
    }
    $transactions = $query->paginate($perPage);
    return response()->json($transactions);
}
}
