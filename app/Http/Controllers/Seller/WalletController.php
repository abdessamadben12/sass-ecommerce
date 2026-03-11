<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class WalletController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();
        $wallet = $user->balance ?? Wallet::create(['user_id' => $user->id, 'balance' => 0]);

        $transactions = $user->transactions()->latest()->paginate(15);

        $totalEarned = $user->transactions()
            ->where('trx_type', '+')
            ->where('status', 'success')
            ->sum('amount');

        $pendingAmount = $user->withdrawals()
            ->where('status', 'pending')
            ->sum('amount');

        return view('seller.wallet.index', compact('wallet', 'transactions', 'totalEarned', 'pendingAmount'));
    }

    public function withdrawals(Request $request): View
    {
        $user = auth()->user();

        $query = $user->withdrawals()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->paginate(15);
        $balance = $user->balance?->balance ?? 0;

        return view('seller.wallet.withdrawals', compact('withdrawals', 'balance'));
    }

    public function requestWithdrawal(Request $request): RedirectResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $balance = $user->balance?->balance ?? 0;

        if ($request->amount > $balance) {
            return back()->with('error', 'Solde insuffisant.');
        }

        $pendingAmount = $user->withdrawals()
            ->where('status', 'pending')
            ->sum('amount');

        if (($request->amount + $pendingAmount) > $balance) {
            return back()->with('error', 'Solde insuffisant apres deduction des retraits en cours.');
        }

        Withdrawal::create([
            'user_id' => $user->id,
            'amount' => $request->amount,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Demande de retrait soumise avec succes.');
    }

    public function invoices(): View
    {
        $invoices = Invoice::where('user_id', auth()->id())
            ->latest()
            ->paginate(15);

        return view('seller.wallet.invoices', compact('invoices'));
    }
}
