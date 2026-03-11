@extends('seller.layouts.app')

@section('title', $product->title)
@section('page-title', 'Detail du produit')

@section('content')
<div class="max-w-4xl mx-auto">
    {{-- Header --}}
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <a href="{{ route('seller.products.index') }}" class="text-sm text-gray-400 hover:text-gray-600 mb-1 inline-block">&larr; Retour aux produits</a>
            <h2 class="text-xl font-bold text-gray-900">{{ $product->title }}</h2>
        </div>
        <div class="flex items-center gap-2">
            @if(in_array($product->status, ['draft', 'rejected']))
                <form method="POST" action="{{ route('seller.products.submit', $product) }}">
                    @csrf
                    <button type="submit" class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-all">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Soumettre pour verification
                    </button>
                </form>
            @endif
            <a href="{{ route('seller.products.edit', $product) }}" class="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Modifier
            </a>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        {{-- Main info --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Preview --}}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="h-64 bg-gray-100 flex items-center justify-center">
                    @if($product->thumbnail_path)
                        <img src="{{ Storage::disk('spaces_2')->url($product->thumbnail_path) }}" alt="{{ $product->title }}" class="w-full h-full object-cover">
                    @else
                        <svg class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    @endif
                </div>

                @if($product->preview_images && count($product->preview_images) > 1)
                    <div class="flex gap-2 p-3 overflow-x-auto">
                        @foreach($product->preview_images as $img)
                            <img src="{{ Storage::disk('spaces_2')->url($img) }}" class="h-16 w-16 rounded-lg object-cover border border-gray-200 shrink-0">
                        @endforeach
                    </div>
                @endif
            </div>

            {{-- Description --}}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-sm font-bold text-gray-900 mb-3">Description</h3>
                <div class="prose prose-sm max-w-none text-gray-600">{!! nl2br(e($product->description)) !!}</div>
            </div>

            {{-- Tags --}}
            @if($product->tags && count($product->tags))
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-bold text-gray-900 mb-3">Tags</h3>
                    <div class="flex flex-wrap gap-2">
                        @foreach($product->tags as $tag)
                            <span class="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{{ $tag }}</span>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        {{-- Sidebar --}}
        <div class="space-y-4">
            {{-- Status --}}
            @php
                $statusMap = [
                    'draft' => ['label' => 'Brouillon', 'bg' => 'bg-gray-100', 'text' => 'text-gray-700'],
                    'pending' => ['label' => 'En attente de verification', 'bg' => 'bg-amber-100', 'text' => 'text-amber-700'],
                    'approved' => ['label' => 'Publie', 'bg' => 'bg-emerald-100', 'text' => 'text-emerald-700'],
                    'rejected' => ['label' => 'Refuse', 'bg' => 'bg-red-100', 'text' => 'text-red-700'],
                    'suspended' => ['label' => 'Suspendu', 'bg' => 'bg-red-100', 'text' => 'text-red-700'],
                ];
                $st = $statusMap[$product->status] ?? $statusMap['draft'];
            @endphp
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-medium text-gray-500 mb-2">Statut</p>
                <span class="inline-flex items-center rounded-lg {{ $st['bg'] }} px-3 py-1.5 text-sm font-semibold {{ $st['text'] }}">{{ $st['label'] }}</span>
                @if($product->status === 'rejected' && $product->reason)
                    <p class="mt-2 text-xs text-red-600">Raison: {{ $product->reason }}</p>
                @endif
            </div>

            {{-- Details --}}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-medium text-gray-500 mb-3">Details</p>
                <dl class="space-y-2">
                    <div class="flex justify-between">
                        <dt class="text-xs text-gray-500">Prix</dt>
                        <dd class="text-sm font-bold text-gray-900">${{ number_format($product->base_price, 2) }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-xs text-gray-500">Categorie</dt>
                        <dd class="text-sm font-medium text-gray-700">{{ $product->category->name ?? '-' }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-xs text-gray-500">Licence</dt>
                        <dd class="text-sm font-medium text-gray-700">{{ $product->license->name ?? '-' }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-xs text-gray-500">Taille fichier</dt>
                        <dd class="text-sm font-medium text-gray-700">{{ $product->file_size_human ?? '-' }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-xs text-gray-500">Cree le</dt>
                        <dd class="text-sm font-medium text-gray-700">{{ $product->created_at?->format('d/m/Y') }}</dd>
                    </div>
                </dl>
            </div>

            {{-- Stats --}}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-medium text-gray-500 mb-3">Statistiques</p>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-gray-50 rounded-lg p-2">
                        <p class="text-lg font-bold text-gray-900">{{ $product->views->count() }}</p>
                        <p class="text-[10px] text-gray-400">Vues</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-2">
                        <p class="text-lg font-bold text-gray-900">{{ $product->downloads->count() }}</p>
                        <p class="text-[10px] text-gray-400">Telechargements</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-2">
                        <p class="text-lg font-bold text-gray-900">{{ $product->reviews->count() }}</p>
                        <p class="text-[10px] text-gray-400">Avis</p>
                    </div>
                </div>
            </div>

            {{-- Delete --}}
            @if($product->status !== 'approved')
                <form method="POST" action="{{ route('seller.products.destroy', $product) }}" onsubmit="return confirm('Etes-vous sur de vouloir supprimer ce produit ?')">
                    @csrf @method('DELETE')
                    <button type="submit" class="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-all">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Supprimer le produit
                    </button>
                </form>
            @endif
        </div>
    </div>
</div>
@endsection
