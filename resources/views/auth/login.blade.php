<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - EtsyEx Market</title>
    <meta name="description" content="Login to EtsyEx Market." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      body { font-family: 'Space Grotesk', sans-serif; background:#0b1220; color:#e2e8f0; }
      .card { background:#0f172a; border:1px solid #1f2937; border-radius:16px; padding:24px; }
      .input { width:100%; padding:12px 14px; border-radius:10px; border:1px solid #334155; background:#0b1220; color:#e2e8f0; }
      .btn { padding:12px 16px; border-radius:10px; background:#22c55e; color:#0b1220; font-weight:600; border:none; cursor:pointer; width:100%; }
      .link { color:#22c55e; text-decoration:none; }
      .error { color:#fca5a5; margin-top:8px; }
    </style>
  </head>
  <body>
    <div style="max-width:480px;margin:60px auto;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1>Login</h1>
        <p>Enter your credentials to continue.</p>
      </div>

      <div class="card">
        <form method="POST" action="{{ route('login.submit') }}">
          @csrf

          <label>Email</label>
          <input class="input" type="email" name="email" value="{{ old('email') }}" required />

          <div style="height:12px;"></div>

          <label>Password</label>
          <input class="input" type="password" name="password" required />

          @if($errors->any())
            <div class="error">{{ $errors->first() }}</div>
          @endif

          <div style="height:16px;"></div>
          <button class="btn" type="submit">Login</button>
        </form>

        <div style="margin-top:16px;text-align:center;">
          <a class="link" href="/">Back to home</a>
        </div>
      </div>
    </div>
  </body>
</html>
