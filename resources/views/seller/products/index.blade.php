@extends('seller.layouts.app')

@section('title', 'Mes Produits')
@section('page-title', 'Mes Produits')

@section('content')
{{-- Stats row --}}
<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    @foreach([
        ['label' => 'Total', 'value' => $stats['total'], 'bg' => 'bg-gray-50', 'text' => 'text-gray-700'],
        ['label' => 'Publies', 'value' => $stats['approved'], 'bg' => 'bg-emerald-50', 'text' => 'text-emerald-700'],
        ['label' => 'En attente', 'value' => $stats['pending'], 'bg' => 'bg-amber-50', 'text' => 'text-amber-700'],
        ['label' => 'Brouillons', 'value' => $stats['draft'], 'bg' => 'bg-gray-50', 'text' => 'text-gray-600'],
    ] as $stat)
        <div class="{{ $stat['bg'] }} rounded-xl p-4 border border-gray-100">
            <p class="text-xs font-medium text-gray-500">{{ $stat['label'] }}</p>
            <p class="text-xl font-black {{ $stat['text'] }} mt-1">{{ $stat['value'] }}</p>
        </div>
    @endforeach
</div>

{{-- Toolbar --}}
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
    <form method="GET" class="flex flex-wrap items-center gap-2">
        <input type="text" name="search" value="{{ request('search') }}" placeholder="Rechercher..."
               class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-48">
        <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" onchange="this.form.submit()">
            <option value="">Tous les statuts</option>
            @foreach(['draft' => 'Brouillon', 'pending' => 'En attente', 'approved' => 'Publie', 'rejected' => 'Refuse'] as $val => $label)
                <option value="{{ $val }}" {{ request('status') === $val ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
        <select name="category" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" onchange="this.form.submit()">
            <option value="">Toutes les categories</option>
            @foreach($categories as $cat)
                <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
    </form>

    <a href="{{ route('seller.products.create') }}" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all shrink-0">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Nouveau produit
    </a>
</div>

{{-- Products grid --}}
@if($products->count())
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @foreach($products as $product)
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div class="h-40 bg-gray-100 relative">
                    @if($product->thumbnail_path)
                        <img src="{{ Storage::disk('spaces_2')->url($product->thumbnail_path) }}" alt="{{ $product->title }}" class="w-full h-full object-cover">
                    @else
                        <div class="w-full h-full flex items-center justify-center">
                            <svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                    @endif

                    @php
                        $statusStyles = [
                            'draft' => 'bg-gray-100 text-gray-600',
                            'pending' => 'bg-amber-100 text-amber-700',
                            'approved' => 'bg-emerald-100 text-emerald-700',
                            'rejected' => 'bg-red-100 text-red-700',
                            'suspended' => 'bg-red-100 text-red-700',
                        ];
                        $statusLabels = ['draft' => 'Brouillon', 'pending' => 'En attente', 'approved' => 'Publie', 'rejected' => 'Refuse', 'suspended' => 'Suspendu'];
                    @endphp
                    <span class="absolute top-2 right-2 rounded-lg px-2 py-0.5 text-[10px] font-bold {{ $statusStyles[$product->status] ?? 'bg-gray-100 text-gray-600' }}">
                        {{ $statusLabels[$product->status] ?? $product->status }}
                    </span>
                </div>

                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 truncate">{{ $product->title }}</h3>
                    <p class="text-xs text-gray-400 mt-0.5">{{ $product->category->name ?? '-' }}</p>

                    <div class="flex items-center justify-between mt-3">
                        <span class="text-lg font-black text-gray-900">${{ number_format($product->base_price, 2) }}</span>
                        <div class="flex items-center gap-1">
                            <a href="{{ route('seller.products.show', $product) }}" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Voir">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </a>
                            <a href="{{ route('seller.products.edit', $product) }}" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <div class="mt-6">{{ $products->withQueryString()->links() }}</div>
@else
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <h3 class="mt-4 text-lg font-bold text-gray-900">Aucun produit</h3>
        <p class="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier produit numerique.</p>
        <a href="{{ route('seller.products.create') }}" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Ajouter un produit
        </a>
    </div>
@endif
@endsection
