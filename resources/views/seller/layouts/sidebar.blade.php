@php
    $currentRoute = Route::currentRouteName() ?? '';
    $nav = [
        ['route' => 'seller.dashboard', 'label' => 'Tableau de bord', 'icon' => 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 'match' => 'seller.dashboard'],
        ['route' => 'seller.products.index', 'label' => 'Produits', 'icon' => 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', 'match' => 'seller.products'],
        ['route' => 'seller.orders.index', 'label' => 'Commandes', 'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', 'match' => 'seller.orders'],
        ['route' => 'seller.wallet.index', 'label' => 'Portefeuille', 'icon' => 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', 'match' => 'seller.wallet'],
        ['route' => 'seller.analytics.index', 'label' => 'Analytiques', 'icon' => 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 'match' => 'seller.analytics'],
        ['route' => 'seller.tickets.index', 'label' => 'Support', 'icon' => 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', 'match' => 'seller.tickets'],
        ['route' => 'seller.profile.index', 'label' => 'Profil & Boutique', 'icon' => 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 'match' => 'seller.profile'],
    ];
@endphp

{{-- Mobile sidebar --}}
<div x-show="sidebarOpen" x-transition:enter="transition ease-in-out duration-300 transform"
     x-transition:enter-start="-translate-x-full" x-transition:enter-end="translate-x-0"
     x-transition:leave="transition ease-in-out duration-300 transform"
     x-transition:leave-start="translate-x-0" x-transition:leave-end="-translate-x-full"
     class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden">
    <div class="flex h-16 items-center justify-between px-6 border-b border-gray-100">
        <a href="{{ route('seller.dashboard') }}" class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span class="font-bold text-gray-900">Seller Panel</span>
        </a>
        <button @click="sidebarOpen = false" class="p-1 rounded-lg hover:bg-gray-100">
            <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
    </div>
    @include('seller.layouts._nav', ['nav' => $nav, 'currentRoute' => $currentRoute])
</div>

{{-- Desktop sidebar --}}
<div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
    <div class="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
        <div class="flex h-16 items-center px-6 border-b border-gray-100">
            <a href="{{ route('seller.dashboard') }}" class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                    {{ substr(auth()->user()->name ?? 'S', 0, 1) }}
                </div>
                <div>
                    <p class="text-sm font-bold text-gray-900 leading-tight">{{ auth()->user()->shops()->first()->shop_name ?? 'Ma Boutique' }}</p>
                    <p class="text-[10px] text-gray-400 font-medium">Espace vendeur</p>
                </div>
            </a>
        </div>
        @include('seller.layouts._nav', ['nav' => $nav, 'currentRoute' => $currentRoute])
    </div>
</div>
