<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('title', 'Seller Area')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/resources/css/seller/app.css">
    @stack('styles')
</head>
<body>
    @seller
    <div class="shell">

        <header class="topbar">
            <div>
                <strong>Seller Space</strong>
                <div class="muted" style="font-size: 13px;">Welcome, {{ auth()->user()->name ?? 'Seller' }}</div>
            </div>
            <div style="display:flex; gap:8px;">
                <a href="{{ route('home') }}" class="btn btn-outline">Marketplace</a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="btn btn-outline">Logout</button>
                </form>
            </div>
        </header>

        @yield('content')
    </div>
    @stack('scripts')
      @endseller
</body>
</html>

