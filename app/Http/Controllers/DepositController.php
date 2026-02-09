<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Deposit;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\MoneyService;
use Illuminate\Support\Facades\DB;

class DepositController extends Controller
{
    public function getDeposits(Request $request)
    {
        $status = $request->status;
        $startDate = $request->input('start_date') !== null ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') !== null ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $trxOrName = $request->input('search', null);
        $perPage = $request->input('per_page', 10);
        $query = Deposit::query();

        if ($trxOrName !== null) {
            $query->where(function ($q) use ($trxOrName) {
                $q->whereHas('user', function ($uq) use ($trxOrName) {
                    $uq->where('name', 'like', '%' . $trxOrName . '%');
                })->orWhere('transaction_id', 'like', '%' . $trxOrName . '%');
            });
        }
        if($startDate !== null && $endDate !== null) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate !== null) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate !== null) {
            $query->where('created_at', '<=', $endDate);
        }
        if (in_array($status, ['pending', 'confirmed', 'rejected'], true)) {
            $query->where('status', $status);
        }
        $deposit = $query->with(['user', 'transactions'])->paginate($perPage);

        return response()->json($deposit, 200);
    }

    public function show(Deposit $deposit)
    {
        $deposit->load(['user', 'transactions']);
        return response()->json($deposit, 200);
    }

    public function approve(Request $request, Deposit $deposit, MoneyService $moneyService)
    {
        if ($deposit->status === 'confirmed') {
            return response()->json(['message' => 'Deposit already confirmed'], 400);
        }
        if ($deposit->status === 'rejected') {
            return response()->json(['message' => 'Deposit already rejected'], 400);
        }

        DB::transaction(function () use ($deposit, $moneyService) {
            $deposit->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);
            $moneyService->addBalance($deposit->user, (float) $deposit->amount, 'Deposit confirmed', $deposit);
        });

        return response()->json(['message' => 'Deposit confirmed'], 200);
    }

    public function reject(Request $request, Deposit $deposit)
    {
        $data = $request->validate([
            'reason' => 'nullable|string',
        ]);

        if ($deposit->status === 'confirmed') {
            return response()->json(['message' => 'Cannot reject a confirmed deposit'], 400);
        }

        $deposit->update([
            'status' => 'rejected',
            'confirmed_at' => null,
            'notes' => $data['reason'] ?? $deposit->notes,
        ]);

        return response()->json(['message' => 'Deposit rejected'], 200);
    }
    
}
