@extends('seller.layouts.app')

@section('title', 'Analytiques')
@section('page-title', 'Analytiques')

@section('content')
{{-- KPI cards --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <div>
                <p class="text-2xl font-black text-gray-900">{{ number_format($totalViews) }}</p>
                <p class="text-xs text-gray-400">Vues totales</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </div>
            <div>
                <p class="text-2xl font-black text-gray-900">{{ number_format($totalDownloads) }}</p>
                <p class="text-xs text-gray-400">Telechargements</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg class="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <div>
                <p class="text-2xl font-black text-gray-900">{{ number_format($avgRating, 1) }}</p>
                <p class="text-xs text-gray-400">Note moyenne</p>
            </div>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg class="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <div>
                <p class="text-2xl font-black text-gray-900">{{ number_format($totalReviews) }}</p>
                <p class="text-xs text-gray-400">Avis</p>
            </div>
        </div>
    </div>
</div>

{{-- Charts --}}
<div class="grid gap-6 lg:grid-cols-2 mb-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Vues (30 derniers jours)</h3>
        <div class="relative" style="height: 250px;">
            <canvas id="viewsChart"></canvas>
        </div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Telechargements (30 derniers jours)</h3>
        <div class="relative" style="height: 250px;">
            <canvas id="downloadsChart"></canvas>
        </div>
    </div>
</div>

{{-- Top products --}}
<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-bold text-gray-900">Top produits</h3>
        <a href="{{ route('seller.analytics.export') }}" class="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Exporter CSV
        </a>
    </div>

    @if($topProducts->count())
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
                        <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Vues</th>
                        <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Telechargements</th>
                        <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Avis</th>
                        <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Conversion</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @foreach($topProducts as $product)
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-5 py-3">
                                <a href="{{ route('seller.products.show', $product) }}" class="font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ $product->title }}</a>
                            </td>
                            <td class="px-5 py-3 text-center font-semibold text-gray-700">{{ $product->views_count }}</td>
                            <td class="px-5 py-3 text-center font-semibold text-gray-700">{{ $product->downloads_count }}</td>
                            <td class="px-5 py-3 text-center font-semibold text-gray-700">{{ $product->reviews_count }}</td>
                            <td class="px-5 py-3 text-center">
                                @php
                                    $convRate = $product->views_count > 0 ? round(($product->downloads_count / $product->views_count) * 100, 1) : 0;
                                @endphp
                                <span class="text-sm font-bold {{ $convRate > 10 ? 'text-emerald-600' : ($convRate > 5 ? 'text-amber-600' : 'text-gray-500') }}">{{ $convRate }}%</span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @else
        <div class="p-12 text-center">
            <p class="text-sm text-gray-400">Aucune donnee disponible.</p>
        </div>
    @endif
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } }
        }
    };

    const viewsCtx = document.getElementById('viewsChart');
    if (viewsCtx) {
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: @json($viewsChart['labels']),
                datasets: [{
                    data: @json($viewsChart['values']),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                }]
            },
            options: chartConfig
        });
    }

    const dlCtx = document.getElementById('downloadsChart');
    if (dlCtx) {
        new Chart(dlCtx, {
            type: 'line',
            data: {
                labels: @json($downloadsChart['labels']),
                datasets: [{
                    data: @json($downloadsChart['values']),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                }]
            },
            options: chartConfig
        });
    }
});
</script>
@endpush
