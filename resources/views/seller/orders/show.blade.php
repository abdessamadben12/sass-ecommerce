@extends('seller.layouts.app')

@section('title', 'Commande')
@section('page-title', 'Detail de la commande')

@section('content')
<div class="max-w-3xl mx-auto">
    <a href="{{ route('seller.orders.index') }}" class="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">&larr; Retour aux commandes</a>

    <div class="grid gap-6 lg:grid-cols-2">
        {{-- Order info --}}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Informations commande</h3>
            <dl class="space-y-3">
                <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Commande #</dt>
                    <dd class="text-sm font-semibold text-gray-900">{{ $order->order->id ?? '-' }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Statut</dt>
                    <dd>
                        @php
                            $ostatus = $order->order->status ?? 'pending';
                            $styles = ['pending' => 'bg-amber-100 text-amber-700', 'paid' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-emerald-100 text-emerald-700', 'cancelled' => 'bg-red-100 text-red-700'];
                        @endphp
                        <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $styles[$ostatus] ?? 'bg-gray-100 text-gray-600' }}">{{ ucfirst($ostatus) }}</span>
                    </dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Montant</dt>
                    <dd class="text-sm font-bold text-gray-900">${{ number_format($order->price, 2) }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Date</dt>
                    <dd class="text-sm text-gray-700">{{ $order->created_at?->format('d/m/Y a H:i') }}</dd>
                </div>
            </dl>
        </div>

        {{-- Buyer info --}}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Acheteur</h3>
            <dl class="space-y-3">
                <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Email</dt>
                    <dd class="text-sm font-medium text-gray-700">{{ $order->order->user->email ?? '-' }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">Nom</dt>
                    <dd class="text-sm font-medium text-gray-700">{{ $order->order->user->name ?? '-' }}</dd>
                </div>
            </dl>
        </div>
    </div>

    {{-- Product info --}}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Produit</h3>
        <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                @if($order->product->thumbnail_path ?? false)
                    <img src="{{ Storage::disk('spaces_2')->url($order->product->thumbnail_path) }}" class="h-full w-full rounded-xl object-cover">
                @else
                    <svg class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                @endif
            </div>
            <div>
                <p class="font-semibold text-gray-900">{{ $order->product->title ?? '-' }}</p>
                <p class="text-xs text-gray-400">{{ $order->product->category->name ?? '' }}</p>
            </div>
        </div>
    </div>

    {{-- Download history --}}
    @if($order->product->downloads && $order->product->downloads->count())
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Historique des telechargements</h3>
            <div class="space-y-2">
                @foreach($order->product->downloads as $dl)
                    <div class="flex items-center justify-between py-2 {{ !$loop->last ? 'border-b border-gray-50' : '' }}">
                        <div class="text-sm text-gray-600">{{ $dl->downloaded_at?->format('d/m/Y H:i') ?? $dl->created_at?->format('d/m/Y H:i') }}</div>
                        <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $dl->status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600' }}">
                            {{ ucfirst($dl->status ?? 'initiated') }}
                        </span>
                    </div>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection
