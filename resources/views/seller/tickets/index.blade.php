@extends('seller.layouts.app')

@section('title', 'Support')
@section('page-title', 'Centre de support')

@section('content')
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
    <form method="GET" class="flex flex-wrap items-center gap-2">
        <select name="status" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" onchange="this.form.submit()">
            <option value="">Tous les statuts</option>
            @foreach(['new' => 'Nouveau', 'in_progress' => 'En cours', 'pending' => 'En attente', 'resolved' => 'Resolu', 'closed' => 'Ferme'] as $val => $label)
                <option value="{{ $val }}" {{ request('status') === $val ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
        <select name="priority" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" onchange="this.form.submit()">
            <option value="">Toutes les priorites</option>
            @foreach(['low' => 'Basse', 'medium' => 'Moyenne', 'high' => 'Haute', 'critical' => 'Critique'] as $val => $label)
                <option value="{{ $val }}" {{ request('priority') === $val ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
    </form>

    <a href="{{ route('seller.tickets.create') }}" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all shrink-0">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Nouveau ticket
    </a>
</div>

<div class="space-y-3">
    @forelse($tickets as $ticket)
        <a href="{{ route('seller.tickets.show', $ticket) }}" class="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-mono text-gray-400">{{ $ticket->ticket_number }}</span>
                        @php
                            $prioStyles = ['low' => 'bg-gray-100 text-gray-600', 'medium' => 'bg-blue-100 text-blue-700', 'high' => 'bg-amber-100 text-amber-700', 'critical' => 'bg-red-100 text-red-700'];
                        @endphp
                        <span class="inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold {{ $prioStyles[$ticket->priority] ?? 'bg-gray-100 text-gray-600' }}">{{ ucfirst($ticket->priority) }}</span>
                    </div>
                    <h3 class="font-semibold text-gray-900 truncate">{{ $ticket->title }}</h3>
                    <p class="text-xs text-gray-400 mt-1 line-clamp-1">{{ $ticket->description }}</p>
                </div>
                <div class="text-right shrink-0">
                    @php
                        $tStyles = ['new' => 'bg-blue-100 text-blue-700', 'in_progress' => 'bg-amber-100 text-amber-700', 'pending' => 'bg-gray-100 text-gray-600', 'resolved' => 'bg-emerald-100 text-emerald-700', 'closed' => 'bg-gray-100 text-gray-500'];
                    @endphp
                    <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $tStyles[$ticket->status] ?? 'bg-gray-100 text-gray-600' }}">{{ ucfirst(str_replace('_', ' ', $ticket->status)) }}</span>
                    <p class="text-[10px] text-gray-400 mt-1">{{ $ticket->created_at?->diffForHumans() }}</p>
                </div>
            </div>
        </a>
    @empty
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <p class="mt-3 text-sm text-gray-400">Aucun ticket de support.</p>
            <a href="{{ route('seller.tickets.create') }}" class="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">Creer un ticket &rarr;</a>
        </div>
    @endforelse
</div>

@if($tickets->hasPages())
    <div class="mt-6">{{ $tickets->withQueryString()->links() }}</div>
@endif
@endsection
