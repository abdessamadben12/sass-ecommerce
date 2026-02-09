<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - EtsyEx Market</title>
    <meta name="description" content="Login to EtsyEx Market as a buyer or seller." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <style>
      body { font-family: 'Space Grotesk', sans-serif; background:#0b1220; color:#e2e8f0; }
      .card { background:#0f172a; border:1px solid #1f2937; border-radius:16px; padding:24px; }
      .tab { padding:10px 16px; border-radius:12px; background:#111827; color:#94a3b8; cursor:pointer; }
      .tab.active { background:#22c55e; color:#0b1220; font-weight:600; }
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
        <p>Choose your account type to continue.</p>
      </div>

      <div class="card">
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <div class="tab" data-role="buyer">Buyer</div>
          <div class="tab" data-role="seller">Seller</div>
        </div>

        <form method="POST" action="{{ route('login.submit') }}">
          @csrf
          <input type="hidden" name="role" id="role" value="{{ $role }}" />

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

    <script>
      $(function(){
        const initialRole = "{{ $role }}" || "buyer";
        $(".tab").each(function(){
          if ($(this).data("role") === initialRole) {
            $(this).addClass("active");
          }
        });
        $(".tab").on("click", function(){
          $(".tab").removeClass("active");
          $(this).addClass("active");
          $("#role").val($(this).data("role"));
        });
      });
    </script>
  </body>
</html>
