@extends('seller.layouts.app')

@section('title', 'Modifier - ' . $product->title)
@section('page-title', 'Modifier le produit')

@section('content')
<div class="max-w-3xl mx-auto">
    <form method="POST" action="{{ route('seller.products.update', $product) }}" enctype="multipart/form-data" class="space-y-6">
        @csrf @method('PUT')

        {{-- Basic info --}}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Informations generales</h3>

            <div class="space-y-4">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <input id="title" name="title" type="text" value="{{ old('title', $product->title) }}" required
                           class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    @error('title') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea id="description" name="description" rows="5" required
                              class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none">{{ old('description', $product->description) }}</textarea>
                    @error('description') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label for="category_id" class="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                        <select id="category_id" name="category_id" required class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                            @foreach($categories as $cat)
                                <option value="{{ $cat->id }}" {{ old('category_id', $product->category_id) == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label for="license_id" class="block text-sm font-medium text-gray-700 mb-1">Licence</label>
                        <select id="license_id" name="license_id" class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                            <option value="">Aucune</option>
                            @foreach($licenses as $license)
                                <option value="{{ $license->id }}" {{ old('license_id', $product->license_id) == $license->id ? 'selected' : '' }}>{{ $license->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label for="base_price" class="block text-sm font-medium text-gray-700 mb-1">Prix ($) *</label>
                        <input id="base_price" name="base_price" type="number" step="0.01" min="0" value="{{ old('base_price', $product->base_price) }}" required
                               class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                    </div>

                    <div>
                        <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <input id="tags" name="tags" type="text" value="{{ old('tags', is_array($product->tags) ? implode(', ', $product->tags) : '') }}"
                               class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                               placeholder="design, template, premium...">
                    </div>
                </div>
            </div>
        </div>

        {{-- Current file info --}}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Fichiers</h3>

            @if($product->main_file_path)
                <div class="mb-4 rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-3">
                    <svg class="h-8 w-8 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-700">Fichier actuel</p>
                        <p class="text-xs text-gray-400">{{ $product->file_size_human ?? '-' }}</p>
                    </div>
                </div>
            @endif

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Remplacer le fichier principal</label>
                    <input type="file" name="main_file" class="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ajouter des images</label>
                    <input type="file" name="preview_images[]" multiple accept="image/*" class="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100">
                </div>

                @if($product->preview_images && count($product->preview_images))
                    <div>
                        <p class="text-xs text-gray-500 mb-2">Images actuelles :</p>
                        <div class="flex gap-2 flex-wrap">
                            @foreach($product->preview_images as $img)
                                <img src="{{ Storage::disk('spaces_2')->url($img) }}" class="h-20 w-20 rounded-lg object-cover border border-gray-200">
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>
        </div>

        {{-- Submit --}}
        <div class="flex items-center justify-between">
            <a href="{{ route('seller.products.show', $product) }}" class="text-sm text-gray-500 hover:text-gray-700 font-medium">&larr; Retour</a>
            <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                Sauvegarder les modifications
            </button>
        </div>
    </form>
</div>
@endsection
