@extends('seller.layouts.app')

@section('title', 'Bienvenue')
@section('page-title', 'Configuration de votre compte')

@section('content')
<div class="max-w-4xl mx-auto">
    {{-- Progress header --}}
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Bienvenue sur votre espace vendeur !</h2>
                <p class="text-sm text-gray-500 mt-1">Completez ces etapes pour commencer a vendre.</p>
            </div>
            <div class="text-right">
                <span class="text-3xl font-black text-blue-600">{{ $stats['percentage'] }}%</span>
                <p class="text-xs text-gray-400">Complete</p>
            </div>
        </div>

        {{-- Progress bar --}}
        <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                 style="width: {{ $stats['percentage'] }}%"></div>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ $stats['completed'] }} sur {{ $stats['total'] }} etapes completees</p>
    </div>

    {{-- Steps --}}
    <div class="space-y-3 mb-8">
        @foreach($steps as $step)
            <div class="bg-white rounded-xl shadow-sm border {{ $step['completed'] ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100' }} p-5 flex items-center gap-4">
                <div class="shrink-0">
                    @if($step['completed'])
                        <div class="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                        </div>
                    @else
                        <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <div class="h-3 w-3 rounded-full bg-gray-300"></div>
                        </div>
                    @endif
                </div>

                <div class="flex-1">
                    <p class="text-sm font-semibold {{ $step['completed'] ? 'text-emerald-700' : 'text-gray-900' }}">{{ $step['title'] }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{{ $step['description'] }}</p>
                </div>

                <div class="shrink-0">
                    @if($step['completed'])
                        <span class="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Termine</span>
                    @elseif($step['key'] === 'profile_completed')
                        <a href="{{ route('seller.profile.index') }}" class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all">Completer</a>
                    @elseif($step['key'] === 'first_product_created')
                        <a href="{{ route('seller.products.create') }}" class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all">Ajouter</a>
                    @elseif($step['is_manual'])
                        <form method="POST" action="{{ route('seller.onboarding.updateStep') }}">
                            @csrf
                            <input type="hidden" name="step" value="{{ $step['key'] }}">
                            <input type="hidden" name="completed" value="1">
                            <button type="submit" class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all">Marquer termine</button>
                        </form>
                    @else
                        <span class="inline-flex items-center rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">En attente</span>
                    @endif
                </div>
            </div>
        @endforeach
    </div>

    {{-- Tutorials --}}
    @if(!empty($tutorials))
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Tutoriels pour bien demarrer</h3>
        <div class="grid gap-4 sm:grid-cols-3">
            @foreach($tutorials as $tutorial)
                <div class="rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div class="h-32 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                        <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h4 class="text-sm font-semibold text-gray-900">{{ $tutorial['title'] }}</h4>
                    <p class="text-xs text-gray-500 mt-1">{{ $tutorial['description'] }}</p>
                    <p class="text-xs text-blue-600 font-medium mt-2">{{ $tutorial['duration'] }}</p>
                </div>
            @endforeach
        </div>
    </div>
    @endif

    {{-- Skip / Complete guide --}}
    @if(!$guideCompleted && $stats['percentage'] >= 80)
        <div class="mt-6 text-center">
            <form method="POST" action="{{ route('seller.onboarding.complete') }}">
                @csrf
                <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all">
                    Acceder au tableau de bord
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </button>
            </form>
        </div>
    @endif
</div>
@endsection
