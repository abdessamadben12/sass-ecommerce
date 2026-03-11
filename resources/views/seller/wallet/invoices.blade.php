@extends('seller.layouts.app')

@section('title', 'Factures')
@section('page-title', 'Factures')

@section('content')
<div class="mb-4">
    <a href="{{ route('seller.wallet.index') }}" class="text-sm text-gray-400 hover:text-gray-600">&larr; Retour au portefeuille</a>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    @if($invoices->count())
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numero</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date emission</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Echeance</th>
                        <th class="px-5 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    @foreach($invoices as $invoice)
                        <tr class="hover:bg-gray-50/50">
                            <td class="px-5 py-4 font-mono text-sm text-gray-900">{{ $invoice->invoice_number }}</td>
                            <td class="px-5 py-4 font-bold text-gray-900">${{ number_format($invoice->total_amount, 2) }}</td>
                            <td class="px-5 py-4">
                                @php
                                    $invStyles = ['draft' => 'bg-gray-100 text-gray-600', 'sent' => 'bg-blue-100 text-blue-700', 'paid' => 'bg-emerald-100 text-emerald-700', 'refunded' => 'bg-red-100 text-red-700'];
                                @endphp
                                <span class="inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold {{ $invStyles[$invoice->status] ?? 'bg-gray-100 text-gray-600' }}">{{ ucfirst($invoice->status) }}</span>
                            </td>
                            <td class="px-5 py-4 text-xs text-gray-400">{{ $invoice->issue_date?->format('d/m/Y') ?? '-' }}</td>
                            <td class="px-5 py-4 text-xs text-gray-400">{{ $invoice->due_date?->format('d/m/Y') ?? '-' }}</td>
                            <td class="px-5 py-4">
                                @if($invoice->pdf_path)
                                    <a href="{{ Storage::disk('spaces_2')->url($invoice->pdf_path) }}" target="_blank" class="text-blue-600 hover:text-blue-700 text-xs font-medium">Telecharger</a>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="px-5 py-3 border-t border-gray-100">{{ $invoices->links() }}</div>
    @else
        <div class="p-12 text-center">
            <p class="text-sm text-gray-400">Aucune facture disponible.</p>
        </div>
    @endif
</div>
@endsection
