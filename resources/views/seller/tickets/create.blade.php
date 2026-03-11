@extends('seller.layouts.app')

@section('title', 'Nouveau Ticket')
@section('page-title', 'Creer un ticket')

@section('content')
<div class="max-w-2xl mx-auto">
    <a href="{{ route('seller.tickets.index') }}" class="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">&larr; Retour au support</a>

    <form method="POST" action="{{ route('seller.tickets.store') }}" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        @csrf

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input type="text" name="title" value="{{ old('title') }}" required
                   class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                   placeholder="Resume de votre probleme">
            @error('title') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" required class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="support" {{ old('type') === 'support' ? 'selected' : '' }}>Support technique</option>
                    <option value="report" {{ old('type') === 'report' ? 'selected' : '' }}>Signalement</option>
                    <option value="feature_request" {{ old('type') === 'feature_request' ? 'selected' : '' }}>Demande de fonctionnalite</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priorite *</label>
                <select name="priority" required class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="low" {{ old('priority') === 'low' ? 'selected' : '' }}>Basse</option>
                    <option value="medium" {{ old('priority', 'medium') === 'medium' ? 'selected' : '' }}>Moyenne</option>
                    <option value="high" {{ old('priority') === 'high' ? 'selected' : '' }}>Haute</option>
                    <option value="critical" {{ old('priority') === 'critical' ? 'selected' : '' }}>Critique</option>
                </select>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description * <span class="text-gray-400">(min 20 caracteres)</span></label>
            <textarea name="description" rows="6" required minlength="20"
                      class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Decrivez votre probleme en detail...">{{ old('description') }}</textarea>
            @error('description') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                Envoyer le ticket
            </button>
        </div>
    </form>
</div>
@endsection
