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
    $query = Transaction::query()->with('user');  
    if ($trxOrName !== null) {
        $query->where(function ($q) use ($trxOrName) {
            $q->whereHas('user', function ($q2) use ($trxOrName) {
                $q2->where('name', 'like', '%' . $trxOrName . '%');
            })->orWhere('trx', 'like', '%' . $trxOrName . '%')
              ->orWhere('id', $trxOrName);
        });
    }
    if ($startDate !== null && $endDate !== null) {
        $query->whereBetween('created_at', [$startDate, $endDate]);
    } elseif ($startDate !== null) {
        $query->where('created_at', '>=', $startDate);
    } elseif ($endDate !== null) {
        $query->where('created_at', '<=', $endDate);
    }
    if (!empty($status) && $status !== 'null' && $status !== 'all') {
        $normalized = $status;
        if ($status === 'confirmed') {
            $normalized = 'success';
        } elseif ($status === 'rejected') {
            $normalized = 'failed';
        }
        $query->where('status', $normalized);
    }
    $transactions = $query->with('user')->paginate($perPage);
    return response()->json($transactions);
}

public function getTransactionDetail($id)
{
    $transaction = Transaction::with('user')->find($id);
    if (!$transaction) {
        return response()->json(['message' => 'Transaction not found'], 404);
    }
    return response()->json($transaction);
}
}
