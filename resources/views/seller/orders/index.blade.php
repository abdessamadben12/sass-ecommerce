@extends('seller.layouts.app')

@section('title', 'Commandes')
@section('page-title', 'Commandes')

@section('content')
{{-- Summary --}}
<div class="grid sm:grid-cols-2 gap-4 mb-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div class="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
            <p class="text-xs font-medium text-gray-500">Revenu total des ventes</p>
            <p class="text-2xl font-black text-gray-900">${{ number_format($totalSales, 2) }}</p>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <div>
            <p class="text-xs font-medium text-gray-500">Total commandes</p>
            <p class="text-2xl font-black text-gray-900">{{ $totalCount }}</p>
        </div>
    </div>
</div>

{{-- Filters --}}
<div class="flex flex-wrap items-center gap-2 mb-6">
    <form method="GET" class="flex flex-wrap items-center gap-2">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher..."
               class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-48">
        <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" onchange="this.form.submit()">
            <option value="">Tous</option>
            @foreach(['pending' => 'En attente', 'paid' => 'Payee', 'completed' => 'Completee', 'cancelled' => 'Annulee'] as $val => $label)
                <option value="{{ $val }}" {{ request('status') === $val ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
    </form>
</div>

{{-- Orders table --}}
<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    @if($orders->count())
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acheteur</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prix</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th class="px-5 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @foreach($orders as $item)
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-5 py-4">
                                <p class="font-medium text-gray-900 truncate max-w-[200px]">{{ $item->product->title ?? '-' }}</p>
                            </td>
                            <td class="px-5 py-4 text-gray-500">{{ $item->order->user->email ?? '-' }}</td>
                            <td class="px-5 py-4 font-bold text-gray-900">${{ number_format($item->price, 2) }}</td>
                            <td class="px-5 py-4">
                                @php
                                    $ostatus = $item->order->status ?? 'pending';
                                    $orderStyles = [
                                        'pending' => 'bg-amber-100 text-amber-700',
                                        'paid' => 'bg-blue-100 text-blue-700',
                                        'completed' => 'bg-emerald-100 text-emerald-700',
                                        'cancelled' => 'bg-red-100 text-red-700',
                                    ];
                                @endphp
                                <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $orderStyles[$ostatus] ?? 'bg-gray-100 text-gray-600' }}">{{ ucfirst($ostatus) }}</span>
                            </td>
                            <td class="px-5 py-4 text-xs text-gray-400">{{ $item->created_at?->format('d/m/Y H:i') }}</td>
                            <td class="px-5 py-4">
                                <a href="{{ route('seller.orders.show', $item) }}" class="text-blue-600 hover:text-blue-700 text-xs font-medium">Details</a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100">{{ $orders->withQueryString()->links() }}</div>
    @else
        <div class="p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <p class="mt-3 text-sm text-gray-400">Aucune commande trouvee.</p>
        </div>
    @endif
</div>
@endsection
