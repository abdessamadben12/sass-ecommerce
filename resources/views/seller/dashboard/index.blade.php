@extends('seller.layouts.app')

@section('title', 'Tableau de bord')
@section('page-title', 'Tableau de bord')

@section('content')
{{-- KPI Cards --}}
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus total</p>
                <p class="text-2xl font-black text-gray-900 mt-1">${{ number_format($totalRevenue, 2) }}</p>
                <p class="text-xs text-gray-400 mt-1">Ce mois: ${{ number_format($monthlyRevenue, 2) }}</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes</p>
                <p class="text-2xl font-black text-gray-900 mt-1">{{ $totalSales }}</p>
                <p class="text-xs text-gray-400 mt-1">Ce mois: {{ $monthlySales }}</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</p>
                <p class="text-2xl font-black text-gray-900 mt-1">{{ $productStats['total'] }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ $productStats['approved'] }} publies / {{ $productStats['draft'] }} brouillons</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</p>
                <p class="text-2xl font-black text-gray-900 mt-1">${{ number_format($walletBalance, 2) }}</p>
                <p class="text-xs text-gray-400 mt-1">En attente: ${{ number_format($pendingWithdrawals, 2) }}</p>
            </div>
            <div class="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
        </div>
    </div>
</div>

<div class="grid gap-6 lg:grid-cols-3">
    {{-- Revenue chart --}}
    <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Revenus (6 derniers mois)</h3>
        <div class="relative" style="height: 250px;">
            <canvas id="revenueChart"></canvas>
        </div>
    </div>

    {{-- Product status breakdown --}}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Statut des produits</h3>
        <div class="space-y-3">
            @php
                $statusConfig = [
                    'approved' => ['label' => 'Publies', 'color' => 'bg-emerald-500', 'bg' => 'bg-emerald-50', 'text' => 'text-emerald-700'],
                    'pending' => ['label' => 'En attente', 'color' => 'bg-amber-500', 'bg' => 'bg-amber-50', 'text' => 'text-amber-700'],
                    'draft' => ['label' => 'Brouillons', 'color' => 'bg-gray-400', 'bg' => 'bg-gray-50', 'text' => 'text-gray-600'],
                    'rejected' => ['label' => 'Refuses', 'color' => 'bg-red-500', 'bg' => 'bg-red-50', 'text' => 'text-red-700'],
                ];
                $maxStat = max($productStats['approved'], $productStats['pending'], $productStats['draft'], $productStats['rejected'], 1);
            @endphp
            @foreach($statusConfig as $key => $cfg)
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium {{ $cfg['text'] }}">{{ $cfg['label'] }}</span>
                        <span class="text-xs font-bold text-gray-900">{{ $productStats[$key] }}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                        <div class="{{ $cfg['color'] }} h-2 rounded-full transition-all" style="width: {{ ($productStats[$key] / $maxStat) * 100 }}%"></div>
                    </div>
                </div>
            @endforeach
        </div>

        <a href="{{ route('seller.products.create') }}" class="mt-6 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Ajouter un produit
        </a>
    </div>
</div>

{{-- Recent orders & notifications --}}
<div class="grid gap-6 lg:grid-cols-2 mt-6">
    {{-- Recent orders --}}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-gray-900">Dernieres commandes</h3>
            <a href="{{ route('seller.orders.index') }}" class="text-xs font-medium text-blue-600 hover:text-blue-700">Voir tout &rarr;</a>
        </div>

        @forelse($recentOrders as $item)
            <div class="flex items-center gap-3 py-3 {{ !$loop->last ? 'border-b border-gray-50' : '' }}">
                <div class="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ $item->product->title ?? 'Produit' }}</p>
                    <p class="text-xs text-gray-400">{{ $item->order->user->email ?? '-' }}</p>
                </div>
                <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-gray-900">${{ number_format($item->price, 2) }}</p>
                    <p class="text-[10px] text-gray-400">{{ $item->created_at?->diffForHumans() }}</p>
                </div>
            </div>
        @empty
            <div class="py-8 text-center">
                <svg class="mx-auto h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <p class="mt-2 text-sm text-gray-400">Aucune commande pour le moment.</p>
            </div>
        @endforelse
    </div>

    {{-- Notifications --}}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Notifications recentes</h3>

        @forelse($recentNotifications as $notif)
            <div class="flex items-start gap-3 py-3 {{ !$loop->last ? 'border-b border-gray-50' : '' }}">
                <div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ $notif->title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ $notif->message }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ $notif->created_at?->diffForHumans() }}</p>
                </div>
            </div>
        @empty
            <div class="py-8 text-center">
                <svg class="mx-auto h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <p class="mt-2 text-sm text-gray-400">Aucune notification.</p>
            </div>
        @endforelse
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: @json($monthlyRevenueChart['labels']),
            datasets: [{
                label: 'Revenus ($)',
                data: @json($monthlyRevenueChart['values']),
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
            },
            resize: true
        }
    });
});
</script>
@endpush
