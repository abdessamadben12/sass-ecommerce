@extends('seller.layouts.app')

@section('title', 'Mes Retraits')
@section('page-title', 'Historique des retraits')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <a href="{{ route('seller.wallet.index') }}" class="text-sm text-gray-400 hover:text-gray-600">&larr; Retour au portefeuille</a>
        <p class="text-sm text-gray-500 mt-1">Solde disponible: <span class="font-bold text-gray-900">${{ number_format($balance, 2) }}</span></p>
    </div>
    <form method="GET" class="flex gap-2">
        <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" onchange="this.form.submit()">
            <option value="">Tous les statuts</option>
            @foreach(['pending' => 'En attente', 'approved' => 'Approuve', 'rejected' => 'Refuse'] as $val => $label)
                <option value="{{ $val }}" {{ request('status') === $val ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
    </form>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    @if($withdrawals->count())
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @foreach($withdrawals as $w)
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-5 py-4 text-gray-500">#{{ $w->id }}</td>
                            <td class="px-5 py-4 font-bold text-gray-900">${{ number_format($w->amount, 2) }}</td>
                            <td class="px-5 py-4">
                                @php
                                    $wStyles = ['pending' => 'bg-amber-100 text-amber-700', 'approved' => 'bg-emerald-100 text-emerald-700', 'rejected' => 'bg-red-100 text-red-700'];
                                @endphp
                                <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $wStyles[$w->status] ?? 'bg-gray-100 text-gray-600' }}">
                                    {{ ucfirst($w->status) }}
                                </span>
                            </td>
                            <td class="px-5 py-4 text-gray-500 max-w-[200px] truncate">{{ $w->notes ?? '-' }}</td>
                            <td class="px-5 py-4 text-xs text-gray-400">{{ $w->created_at?->format('d/m/Y H:i') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100">{{ $withdrawals->withQueryString()->links() }}</div>
    @else
        <div class="p-12 text-center">
            <p class="text-sm text-gray-400">Aucun retrait effectue.</p>
        </div>
    @endif
</div>
@endsection
