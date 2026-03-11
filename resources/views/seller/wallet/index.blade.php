@extends('seller.layouts.app')

@section('title', 'Portefeuille')
@section('page-title', 'Portefeuille')

@section('content')
{{-- Balance cards --}}
<div class="grid sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
        <p class="text-xs font-medium text-blue-200 uppercase tracking-wider">Solde disponible</p>
        <p class="text-3xl font-black mt-1">${{ number_format($wallet->balance, 2) }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total gagne</p>
        <p class="text-2xl font-black text-gray-900 mt-1">${{ number_format($totalEarned, 2) }}</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">En attente de retrait</p>
        <p class="text-2xl font-black text-amber-600 mt-1">${{ number_format($pendingAmount, 2) }}</p>
    </div>
</div>

{{-- Quick actions --}}
<div class="flex flex-wrap gap-3 mb-6">
    <a href="{{ route('seller.wallet.withdrawals') }}" class="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
        Mes retraits
    </a>
    <button onclick="document.getElementById('withdraw-modal').classList.remove('hidden')" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Demander un retrait
    </button>
</div>

{{-- Transactions --}}
<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-bold text-gray-900">Historique des transactions</h3>
    </div>

    @if($transactions->count())
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Remarque</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @foreach($transactions as $trx)
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-5 py-3 font-mono text-xs text-gray-500">{{ $trx->trx }}</td>
                            <td class="px-5 py-3">
                                <span class="inline-flex items-center gap-1 text-sm font-bold {{ $trx->trx_type === '+' ? 'text-emerald-600' : 'text-red-600' }}">
                                    {{ $trx->trx_type === '+' ? '+' : '-' }}
                                </span>
                            </td>
                            <td class="px-5 py-3 font-bold {{ $trx->trx_type === '+' ? 'text-emerald-600' : 'text-red-600' }}">${{ number_format($trx->amount, 2) }}</td>
                            <td class="px-5 py-3 text-gray-600 max-w-[200px] truncate">{{ $trx->remark ?? '-' }}</td>
                            <td class="px-5 py-3">
                                @php
                                    $trxStyles = ['success' => 'bg-emerald-100 text-emerald-700', 'pending' => 'bg-amber-100 text-amber-700', 'failed' => 'bg-red-100 text-red-700'];
                                @endphp
                                <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $trxStyles[$trx->status] ?? 'bg-gray-100 text-gray-600' }}">{{ ucfirst($trx->status) }}</span>
                            </td>
                            <td class="px-5 py-3 text-xs text-gray-400">{{ $trx->created_at?->format('d/m/Y H:i') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100">{{ $transactions->links() }}</div>
    @else
        <div class="p-12 text-center">
            <p class="text-sm text-gray-400">Aucune transaction.</p>
        </div>
    @endif
</div>

{{-- Withdraw modal --}}
<div id="withdraw-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Demander un retrait</h3>
            <button onclick="document.getElementById('withdraw-modal').classList.add('hidden')" class="p-1 rounded-lg hover:bg-gray-100">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <form method="POST" action="{{ route('seller.wallet.withdraw') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant ($)</label>
                <input type="number" name="amount" step="0.01" min="1" max="{{ $wallet->balance }}" required
                       class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                       placeholder="0.00">
                <p class="mt-1 text-xs text-gray-400">Solde disponible: ${{ number_format($wallet->balance, 2) }}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
                <textarea name="notes" rows="2" class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="Informations supplementaires..."></textarea>
            </div>
            <button type="submit" class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                Soumettre la demande
            </button>
        </form>
    </div>
</div>
@endsection
