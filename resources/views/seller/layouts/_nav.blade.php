<nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
    @foreach($nav as $item)
        @php
            $isActive = str_starts_with($currentRoute, $item['match']);
        @endphp
        <a href="{{ route($item['route']) }}"
           class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                  {{ $isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' }}">
            <svg class="h-5 w-5 shrink-0 {{ $isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600' }}"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="{{ $item['icon'] }}"/>
            </svg>
            {{ $item['label'] }}
        </a>
    @endforeach
</nav>

<div class="border-t border-gray-100 p-3">
    <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button type="submit" class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Deconnexion
        </button>
    </form>
</div>
