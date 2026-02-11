<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Services\MoneyService;
                    

class WithdrawalsController extends Controller
{
    public function getWithdrawals(Request $request)
    {
        $status = $request->status;
        $startDate = $request->input('start_date') !== null ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') !== null ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $trxOrName = $request->input('search', null);
        $perPage = $request->input('per_page', 10);
        $query = Withdrawal::query();

        if ($trxOrName !== null) {
            $query->where(function ($q) use ($trxOrName) {
                $q->whereHas('user', function ($uq) use ($trxOrName) {
                    $uq->where('name', 'like', '%' . $trxOrName . '%');
                })->orWhereHas('transactions', function ($tq) use ($trxOrName) {
                    $tq->where('trx', 'like', '%' . $trxOrName . '%');
                });
            });
        }
        if($startDate !== null && $endDate !== null) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate !== null) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate !== null) {
            $query->where('created_at', '<=', $endDate);
        }
        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }
        $withdrawals= $query->with(['user',"transactions"])->paginate($perPage);

        return response()->json($withdrawals, 200);
    }

    public function show(Withdrawal $withdrawal)
    {
        $withdrawal->load(['user', 'transactions']);
        return response()->json($withdrawal, 200);
    }

    public function approve(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status === 'approved') {
            return response()->json(['message' => 'Withdrawal already approved'], 400);
        }
        if ($withdrawal->status === 'rejected') {
            return response()->json(['message' => 'Withdrawal already rejected'], 400);
        }

        $data = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $withdrawal->update([
            'status' => 'approved',
            'notes' => $data['reason'] ?? $withdrawal->notes,
        ]);
        if (!$withdrawal->transactions) {
            $moneyService = app(\App\Services\MoneyService::class);
            $moneyService->addBalance($withdrawal->user, 0, $data['reason'] ?? 'Withdrawal approved', $withdrawal);
        }

        return response()->json(['message' => 'Withdrawal approved'], 200);
    }

    public function reject(Request $request, Withdrawal $withdrawal, MoneyService $moneyService)
    {
        $data = $request->validate([
            'reason' => 'nullable|string',
        ]);

        if ($withdrawal->status === 'approved') {
            return response()->json(['message' => 'Cannot reject an approved withdrawal'], 400);
        }

        DB::transaction(function () use ($withdrawal, $moneyService, $data) {
            $withdrawal->update([
                'status' => 'rejected',
                'notes' => $data['reason'] ?? $withdrawal->notes,
            ]);
            if (!$withdrawal->transactions) {
                $moneyService->addBalance($withdrawal->user, 0, $data['reason'] ?? 'Withdrawal rejected', $withdrawal);
            }
            $moneyService->addBalance($withdrawal->user, (float) $withdrawal->amount, $data['reason'] ?? 'Withdrawal rejected', $withdrawal);
        });

        return response()->json(['message' => 'Withdrawal rejected'], 200);
    }
    
}
