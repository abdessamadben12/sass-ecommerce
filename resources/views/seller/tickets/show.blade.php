@extends('seller.layouts.app')

@section('title', $ticket->title)
@section('page-title', 'Ticket #' . $ticket->ticket_number)

@section('content')
<div class="max-w-3xl mx-auto">
    <a href="{{ route('seller.tickets.index') }}" class="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">&larr; Retour au support</a>

    {{-- Ticket info --}}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-start justify-between gap-4 mb-4">
            <div>
                <h2 class="text-lg font-bold text-gray-900">{{ $ticket->title }}</h2>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs font-mono text-gray-400">{{ $ticket->ticket_number }}</span>
                    @php
                        $prioStyles = ['low' => 'bg-gray-100 text-gray-600', 'medium' => 'bg-blue-100 text-blue-700', 'high' => 'bg-amber-100 text-amber-700', 'critical' => 'bg-red-100 text-red-700'];
                        $tStyles = ['new' => 'bg-blue-100 text-blue-700', 'in_progress' => 'bg-amber-100 text-amber-700', 'pending' => 'bg-gray-100 text-gray-600', 'resolved' => 'bg-emerald-100 text-emerald-700', 'closed' => 'bg-gray-100 text-gray-500'];
                    @endphp
                    <span class="inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold {{ $prioStyles[$ticket->priority] ?? '' }}">{{ ucfirst($ticket->priority) }}</span>
                    <span class="inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold {{ $tStyles[$ticket->status] ?? '' }}">{{ ucfirst(str_replace('_', ' ', $ticket->status)) }}</span>
                </div>
            </div>
            <p class="text-xs text-gray-400">{{ $ticket->created_at?->format('d/m/Y H:i') }}</p>
        </div>

        <div class="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-xl p-4">{!! nl2br(e($ticket->description)) !!}</div>
    </div>

    {{-- Replies --}}
    <div class="space-y-3 mb-6">
        @foreach($ticket->messageReplay as $reply)
            @php
                $isOwn = $reply->user_id === auth()->id();
            @endphp
            <div class="{{ $isOwn ? 'ml-8' : 'mr-8' }}">
                <div class="{{ $isOwn ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100' }} rounded-xl border p-4">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-xs font-semibold {{ $isOwn ? 'text-blue-700' : 'text-gray-700' }}">
                            {{ $reply->user->name ?? 'Utilisateur' }}
                            @if(!$isOwn)
                                <span class="text-[10px] font-normal text-gray-400 ml-1">Support</span>
                            @endif
                        </p>
                        <p class="text-[10px] text-gray-400">{{ $reply->created_at?->diffForHumans() }}</p>
                    </div>
                    <div class="text-sm text-gray-600">{!! nl2br(e($reply->message)) !!}</div>
                </div>
            </div>
        @endforeach
    </div>

    {{-- Reply form --}}
    @if(!in_array($ticket->status, ['closed']))
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-3">Repondre</h3>
            <form method="POST" action="{{ route('seller.tickets.reply', $ticket) }}">
                @csrf
                <textarea name="message" rows="3" required minlength="5"
                          class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                          placeholder="Ecrivez votre reponse..."></textarea>
                @error('message') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror

                <div class="mt-3 flex justify-end">
                    <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-all">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        Envoyer
                    </button>
                </div>
            </form>
        </div>
    @else
        <div class="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-sm text-gray-500">Ce ticket est ferme. Vous ne pouvez plus y repondre.</p>
        </div>
    @endif
</div>
@endsection
