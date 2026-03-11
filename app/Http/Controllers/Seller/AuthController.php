<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Mail\TwoFactorCodeMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class AuthController extends Controller
{
    public function showLoginForm(): View
    {
        return view('seller.auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        if ($request->filled('challenge_id')) {
            return $this->verifyTwoFactor($request);
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, (string) $user->password)) {
            return back()
                ->withErrors(['email' => 'Email ou mot de passe invalide.'])
                ->onlyInput('email');
        }

        if ($user->is_2fa_enabled) {
            $challengeId = Str::random(40);
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            Cache::put('2fa_web_code:' . $challengeId, hash('sha256', $code), now()->addMinutes(5));
            Cache::put('2fa_web_meta:' . $challengeId, [
                'user_id' => $user->id,
                'remember' => $remember,
                'ip_address' => $request->ip(),
            ], now()->addMinutes(5));

            Mail::to($user->email)->send(new TwoFactorCodeMail($code, 5));

            return back()
                ->with('two_factor_required', true)
                ->with('status', 'Un code de verification a ete envoye par email.')
                ->withInput([
                    'challenge_id' => $challengeId,
                ]);
        }

        if (!Auth::attempt($credentials, $remember)) {
            return back()
                ->withErrors(['email' => 'Email ou mot de passe invalide.'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();
        $user = Auth::user();

        return $this->redirectAfterLogin($user);
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $exception) {
            return redirect()
                ->route('login.seller')
                ->withErrors(['email' => 'Connexion Google impossible. Veuillez reessayer.']);
        }

        $googleId = (string) $googleUser->getId();
        $email = strtolower(trim((string) $googleUser->getEmail()));

        if ($email === '') {
            return redirect()
                ->route('login.seller')
                ->withErrors(['email' => 'Votre compte Google ne fournit pas d\'adresse email.']);
        }

        $name = trim((string) $googleUser->getName());
        if ($name === '') {
            $name = Str::before($email, '@');
        }

        $avatar = (string) ($googleUser->getAvatar() ?? '');

        $user = User::where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(40)),
                'google_id' => $googleId,
                'avatar' => $avatar !== '' ? $avatar : null,
                'email_verified_at' => now(),
                'role' => 'buyer',
                'status' => 'active',
            ]);
        } else {
            $user->google_id = $googleId;
            $user->name = $user->name ?: $name;
            $user->avatar = $avatar !== '' ? $avatar : $user->avatar;
            $user->email_verified_at = $user->email_verified_at ?: now();
            $user->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return $this->redirectAfterLogin($user);
    }

    private function verifyTwoFactor(Request $request): RedirectResponse
    {
        $request->validate([
            'challenge_id' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $challengeId = (string) $request->input('challenge_id');
        $otp = (string) $request->input('otp');

        $meta = Cache::get('2fa_web_meta:' . $challengeId);
        $storedHash = Cache::get('2fa_web_code:' . $challengeId);

        if (
            !$meta ||
            !$storedHash ||
            (string) ($meta['ip_address'] ?? '') !== (string) $request->ip()
        ) {
            return back()
                ->withErrors(['otp' => 'Session de verification expiree. Reconnectez-vous.']);
        }

        if (!hash_equals($storedHash, hash('sha256', $otp))) {
            return back()
                ->with('two_factor_required', true)
                ->withInput(['challenge_id' => $challengeId])
                ->withErrors(['otp' => 'Code de verification invalide.']);
        }

        $userId = (int) ($meta['user_id'] ?? 0);
        $remember = (bool) ($meta['remember'] ?? false);
        $user = User::find($userId);

        if (!$user) {
            return back()->withErrors(['email' => 'Utilisateur introuvable.']);
        }

        Cache::forget('2fa_web_meta:' . $challengeId);
        Cache::forget('2fa_web_code:' . $challengeId);

        Auth::loginUsingId($user->id, $remember);
        $request->session()->regenerate();

        return $this->redirectAfterLogin($user);
    }

    private function redirectAfterLogin($user): RedirectResponse
    {
        if (($user->role ?? null) === 'seller') {
            return redirect()->intended(route('seller.dashboard'));
        }

        return redirect()->intended(route('home'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
