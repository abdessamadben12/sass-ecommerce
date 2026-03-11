<header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
            <button @click="sidebarOpen = true" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <h1 class="text-lg font-bold text-gray-900">@yield('page-title', 'Tableau de bord')</h1>
        </div>

        <div class="flex items-center gap-3">
            {{-- Notifications --}}
            @php
                $unreadCount = auth()->user()->notifications()->where('is_read', false)->count();
            @endphp
            <a href="{{ route('seller.dashboard') }}" class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                @if($unreadCount > 0)
                    <span class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{{ $unreadCount > 9 ? '9+' : $unreadCount }}</span>
                @endif
            </a>

            {{-- User menu --}}
            <div class="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}
                </div>
                <div class="hidden sm:block">
                    <p class="text-sm font-semibold text-gray-900 leading-tight">{{ auth()->user()->name }}</p>
                    <p class="text-[10px] text-gray-400">Vendeur</p>
                </div>
            </div>
        </div>
    </div>
</header>
