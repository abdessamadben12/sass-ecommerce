@extends('seller.layouts.app')

@section('title', 'Ma Boutique')
@section('page-title', 'Ma Boutique')

@section('content')
<div class="max-w-3xl mx-auto">
    {{-- Profile nav --}}
    <div class="flex gap-2 mb-6">
        <a href="{{ route('seller.profile.index') }}" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Informations personnelles</a>
        <a href="{{ route('seller.profile.shop') }}" class="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700">Ma Boutique</a>
    </div>

    <form method="POST" action="{{ route('seller.profile.shop.update') }}" enctype="multipart/form-data">
        @csrf @method('PUT')

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            {{-- Shop logo --}}
            <div class="flex items-center gap-4">
                <div class="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    @if($shop && $shop->logo)
                        <img src="{{ Storage::disk('spaces_2')->url($shop->logo) }}" class="h-16 w-16 object-cover">
                    @else
                        <svg class="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    @endif
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Logo de la boutique</label>
                    <input type="file" name="logo" accept="image/*" class="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique *</label>
                <input type="text" name="shop_name" value="{{ old('shop_name', $shop->shop_name ?? '') }}" required
                       class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                       placeholder="Nom de votre boutique">
                @error('shop_name') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="4"
                          class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                          placeholder="Decrivez votre boutique, vos specialites, votre experience...">{{ old('description', $shop->description ?? '') }}</textarea>
                @error('description') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
            </div>

            @if($shop)
                <div class="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">Statistiques de la boutique</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <p class="text-lg font-black text-gray-900">{{ $shop->total_products ?? 0 }}</p>
                            <p class="text-xs text-gray-400">Produits</p>
                        </div>
                        <div>
                            <p class="text-lg font-black text-gray-900">{{ $shop->total_sales ?? 0 }}</p>
                            <p class="text-xs text-gray-400">Ventes</p>
                        </div>
                        <div>
                            <p class="text-lg font-black text-gray-900">${{ number_format($shop->total_revenue ?? 0, 2) }}</p>
                            <p class="text-xs text-gray-400">Revenus</p>
                        </div>
                        <div>
                            <p class="text-lg font-black text-gray-900">{{ number_format($shop->average_rating ?? 0, 1) }}</p>
                            <p class="text-xs text-gray-400">Note moyenne</p>
                        </div>
                    </div>
                </div>

                <div class="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <p class="text-xs text-gray-500">URL de la boutique</p>
                    <p class="text-sm font-mono text-blue-600 mt-1">{{ url('/shop/' . $shop->shop_slug) }}</p>
                </div>
            @endif

            <div class="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-all">
                    Sauvegarder
                </button>
            </div>
        </div>
    </form>
</div>
@endsection
