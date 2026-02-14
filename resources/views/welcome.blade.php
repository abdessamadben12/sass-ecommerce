<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName ?? config('app.name') }}</title>
    @if(!empty($faviconUrl))
        <link rel="icon" type="image/png" href="{{ $faviconUrl }}">
    @endif
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/resources/css/app.css">
</head>
<body class="bg-[#f8fafc] text-slate-900 antialiased">

@php
    $softwareProducts = $featuredProducts->take(8);
    $bookProducts = $featuredProducts->skip(2)->take(8);
    if ($bookProducts->isEmpty()) $bookProducts = $featuredProducts->take(8);
@endphp

<div class="mx-auto min-h-screen max-w-[1280px] bg-white shadow-sm ring-1 ring-slate-200">
    
    <!-- Navbar -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div class="flex items-center justify-between px-6 py-4">
            <a href="/" class="flex items-center gap-2">
                @if(!empty($logoUrl))
                    <img src="{{ $logoUrl }}" alt="{{ $appName }}" class="h-9 w-auto" />
                @else
                    <div class="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {{ substr($appName ?? 'D', 0, 1) }}
                    </div>
                    <span class="text-xl font-extrabold tracking-tight text-slate-900">{{ $appName ?? 'Marketplace' }}</span>
                @endif
            </a>

            <div class="hidden md:flex flex-1 max-w-md mx-8">
                <div class="relative w-full group">
                    <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg class="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input id="global-search" type="text" placeholder="Rechercher un logiciel, ebook..." 
                        class="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
                </div>
            </div>

            <div class="flex items-center gap-4 text-sm font-medium">
                @auth
                    <div class="hidden sm:flex flex-col items-end">
                        <span class="text-xs font-bold text-slate-900">{{ auth()->user()->name }}</span>
                        <span class="text-[10px] text-blue-600 uppercase tracking-wider font-black">{{ auth()->user()->role ?? 'user' }}</span>
                    </div>
                    @if((auth()->user()->role ?? null) === 'admin')
                        <a href="/admin/dashbord" class="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </a>
                    @elseif((auth()->user()->role ?? null) === 'seller')
                        <a href="{{ route('seller.onboarding.index') }}" class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all text-xs font-bold">Espace vendeur</a>
                    @endif
                    <form method="POST" action="{{ route('logout') }}"> @csrf
                        <button class="bg-slate-900 text-white px-5 py-2 rounded-xl hover:bg-slate-800 transition-all text-xs font-bold">Déconnexion</button>
                    </form>
                @else
                    <button id="open-auth-modal" type="button" class="text-slate-600 hover:text-blue-600 transition-colors">Connexion</button>
                    <a href="{{ route('login') }}" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Vendre</a>
                @endauth
            </div>
        </div>

        <nav class="flex items-center gap-2 border-t border-slate-50 bg-white/50 px-6 py-2 overflow-x-auto no-scrollbar">
            <button class="category-menu whitespace-nowrap active rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-100" data-category="all">Tous</button>
            @foreach($categories->take(10) as $category)
                <button class="category-menu whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all" data-category="{{ strtolower($category->name) }}">{{ $category->name }}</button>
            @endforeach
        </nav>
    </header>

    <!-- Hero Section -->
    <section class="relative mx-6 mt-6 overflow-hidden rounded-[2rem] hero-gradient px-8 py-16 text-white">
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 grid items-center gap-12 md:grid-cols-2">
            <div>
                <span class="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold tracking-wider mb-6">PLATEFORME DIGITALE</span>
                <h1 class="text-4xl font-black leading-tight sm:text-6xl mb-6">Boostez vos projets <span class="text-blue-300 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100 italic">instantanément.</span></h1>
                <p class="mb-8 max-w-lg text-lg text-blue-100 font-light leading-relaxed">
                    Découvrez des milliers d'actifs numériques, de logiciels et de templates créés par des experts.
                </p>
                <div class="flex flex-wrap gap-4">
                    <a href="#top-software" class="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20">Explorer le store</a>
                    <button class="px-8 py-4 rounded-2xl font-bold bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">Comment ça marche ?</button>
                </div>
            </div>
            <div class="hidden md:block relative">
                <div class="relative mx-auto w-[320px] h-[320px] rounded-3xl bg-white/10 p-4 backdrop-blur-xl border border-white/20 rotate-3 animate-pulse">
                    <div class="h-full w-full rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <svg class="w-20 h-20 opacity-50 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats/Features -->
    <section class="grid gap-6 p-6 sm:grid-cols-3">
        <div class="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div class="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
                <h4 class="font-bold text-slate-900">Paiement Sécurisé</h4>
                <p class="text-xs text-slate-500">Transaction chiffrée SSL</p>
            </div>
        </div>
        <div class="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                100%
            </div>
            <div>
                <h4 class="font-bold">Qualité Garantie</h4>
                <p class="text-xs text-blue-100">Produits vérifiés à la main</p>
            </div>
        </div>
        <div class="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div class="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
                <h4 class="font-bold">Accès Instantané</h4>
                <p class="text-xs text-slate-500">Téléchargement immédiat</p>
            </div>
        </div>
    </section>

    <!-- Product Rows -->
    <main class="space-y-12 py-8">
        
        <!-- Logiciels -->
        <section id="top-software" class="px-6">
            <div class="mb-6 flex items-end justify-between">
                <div>
                    <h3 class="text-2xl font-black text-slate-900">Logiciels & Systèmes</h3>
                    <p class="text-sm text-slate-500">Les outils les plus performants pour votre business.</p>
                </div>
                <div class="flex gap-2">
                    <button class="scroll-left p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors" data-target="#software-row">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button class="scroll-right p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors" data-target="#software-row">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>

            <div id="software-row" class="product-row flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                @forelse($softwareProducts as $product)
                    <article class="product-card min-w-[260px] group relative rounded-3xl border border-slate-100 bg-white p-3 transition-all"
                        data-name="{{ strtolower($product->title) }}"
                        data-category="{{ strtolower(optional($product->category)->name ?? '') }}">
                        <div class="relative h-44 overflow-hidden rounded-2xl bg-slate-100">
                            <!-- Placeholder Image with Gradient -->
                            <div class="h-full w-full bg-gradient-to-tr from-slate-200 to-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                            <span class="absolute top-2 left-2 rounded-lg bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-black uppercase text-blue-600 shadow-sm">
                                {{ optional($product->category)->name ?? 'Logiciel' }}
                            </span>
                        </div>
                        <div class="mt-4 px-1">
                            <h4 class="truncate font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{{ $product->title }}</h4>
                            <p class="text-[11px] text-slate-500">Par {{ optional($product->shop)->shop_name ?? 'Digital Expert' }}</p>
                            
                            <div class="mt-4 flex items-center justify-between">
                                <span class="text-lg font-black text-slate-900">${{ number_format((float)$product->base_price, 2) }}</span>
                                <div class="flex items-center gap-1">
                                    <svg class="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    <span class="text-xs font-bold text-slate-600">4.8</span>
                                </div>
                            </div>
                        </div>
                    </article>
                @empty
                    <div class="w-full py-12 text-center text-slate-400 italic">Aucun produit trouvé dans cette catégorie.</div>
                @endforelse
            </div>
        </section>

        <!-- Ebooks -->
        <section class="px-6 pb-12">
            <div class="mb-6">
                <h3 class="text-2xl font-black text-slate-900">E-books & Guides</h3>
                <p class="text-sm text-slate-500">Formez-vous avec les meilleurs contenus éducatifs.</p>
            </div>

            <div id="book-row" class="product-row flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                @forelse($bookProducts as $product)
                    <article class="product-card min-w-[200px] group rounded-2xl border border-slate-100 bg-white p-3 transition-all"
                        data-name="{{ strtolower($product->title) }}"
                        data-category="{{ strtolower(optional($product->category)->name ?? '') }}">
                        <div class="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 shadow-inner">
                             <!-- Book cover effect -->
                            <div class="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                            <div class="h-full w-full bg-slate-200 flex items-center justify-center">
                                <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h4 class="truncate text-sm font-bold text-slate-900">{{ $product->title }}</h4>
                            <div class="mt-2 flex items-center justify-between">
                                <span class="text-sm font-black text-blue-600">${{ number_format((float)$product->base_price, 2) }}</span>
                                <span class="text-[10px] font-bold text-slate-400">PDF / EPUB</span>
                            </div>
                        </div>
                    </article>
                @empty
                    <p class="text-sm text-slate-500 italic">Bientôt disponible...</p>
                @endforelse
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 py-12 px-6 text-white rounded-t-[3rem]">
        <div class="grid gap-8 md:grid-cols-4">
            <div class="col-span-2">
                <h2 class="text-2xl font-black mb-4">{{ $appName ?? 'DigitalMarket' }}</h2>
                <p class="text-slate-400 max-w-sm text-sm leading-relaxed">
                    La première place de marché pour les créateurs et entrepreneurs numériques. Accédez à des ressources de qualité pour propulser vos idées.
                </p>
            </div>
            <div>
                <h5 class="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Aide</h5>
                <ul class="space-y-2 text-sm text-slate-400">
                    <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
                    <li><button class="policy-btn hover:text-white" data-policy-title="Conditions" data-policy-content="{{ e($termsOfUse) }}">Conditions d'utilisation</button></li>
                </ul>
            </div>
            <div>
                <h5 class="font-bold mb-4 text-sm uppercase tracking-widest text-slate-500">Contact</h5>
                <p class="text-sm text-slate-400">{{ $supportEmail ?? 'contact@market.com' }}</p>
                <div class="mt-4 flex gap-3">
                    <!-- Social Icons -->
                    <div class="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all italic">f</div>
                    <div class="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all italic">x</div>
                </div>
            </div>
        </div>
        <div class="mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
            &copy; {{ date('Y') }} {{ $appName }}. Tous droits réservés.
        </div>
    </footer>
</div>

@guest
<div id="auth-modal-backdrop" class="auth-modal-backdrop" data-open-on-load="{{ $errors->any() ? '1' : '0' }}">
    <div class="auth-modal">
        <div class="auth-modal-head">
            <h3 class="auth-modal-title">Connexion</h3>
            <button id="close-auth-modal" type="button" class="auth-modal-close">&times;</button>
        </div>

        <div class="auth-modal-body">
            <form method="POST" action="{{ route('login.submit') }}">
                @csrf

                <label class="auth-field-label">Adresse email</label>
                <input class="auth-input" type="email" name="email" value="{{ old('email') }}" required />

                <label class="auth-field-label">Mot de passe</label>
                <input class="auth-input" type="password" name="password" required />

                <div class="auth-row">
                    <label style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" name="remember" value="1" />
                        Rester connecte
                    </label>
                    <a href="{{ route('login') }}" class="underline">Mot de passe oublie ?</a>
                </div>

                @if($errors->any())
                    <p class="auth-error">{{ $errors->first() }}</p>
                @endif

                <button type="submit" class="auth-primary-btn">Se connecter</button>
            </form>

            <div class="auth-separator">OU</div>
            <button type="button" class="auth-social">Continuer avec Google</button>
            <button type="button" class="auth-social">Continuer avec Facebook</button>
        </div>
    </div>
</div>
@endguest

<!-- Modal & Popups (Unchanged Logic, Improved UI) -->
<div id="policy-modal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-8 py-5">
            <h3 id="policy-title" class="text-xl font-bold text-slate-900"></h3>
            <button id="policy-close" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <div id="policy-content" class="max-h-[60vh] overflow-y-auto px-8 py-6 text-sm leading-relaxed text-slate-600"></div>
    </div>
</div>

<div id="cookie-banner" class="fixed bottom-6 right-6 z-50 hidden max-w-sm rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-xl p-6 shadow-2xl ring-1 ring-slate-900/5">
    <p class="text-sm leading-relaxed text-slate-600">
        🍪 Nous utilisons des cookies pour optimiser votre expérience sur notre plateforme.
    </p>
    <div class="mt-4 flex gap-3">
        <button id="cookie-accept" class="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all">Accepter</button>
        <button id="cookie-reject" class="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">Refuser</button>
    </div>
</div>

<script src="/resources/js/app.js"></script>
</body>
</html>
