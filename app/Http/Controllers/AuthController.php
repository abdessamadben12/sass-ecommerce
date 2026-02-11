<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\TwoFactorCodeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $otp = trim((string) $request->input('otp', ''));
        $isOtpStep = $otp !== '';

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'recaptcha_token' => $isOtpStep ? 'nullable|string' : 'required|string',
            'otp' => 'nullable|string',
            'challenge_id' => [
                Rule::requiredIf($isOtpStep),
                'nullable',
                'string',
            ],
        ]);

        if (!$isOtpStep) {
            $recaptchaSecret = config('services.recaptcha.secret');
            if (!$recaptchaSecret) {
                return response()->json(['message' => 'reCAPTCHA secret not configured.'], 500);
            }

            $recaptchaResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $recaptchaSecret,
                'response' => $request->recaptcha_token,
                'remoteip' => $request->ip(),
            ]);

            if (!$recaptchaResponse->ok() || !$recaptchaResponse->json('success')) {
                $this->logLoginAttempt(null, $request->email, 'failed', 'recaptcha_failed', $request);
                return response()->json(['message' => 'reCAPTCHA verification failed.'], 422);
            }
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            $this->logLoginAttempt(null, $request->email, 'failed', 'invalid_credentials', $request);
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $passwordIsValid = Hash::check($request->password, $user->password);
        $shouldUpgradeLegacyPassword = false;
        if (!$passwordIsValid && !$this->isPasswordHashed($user->password)) {
            $passwordIsValid = hash_equals((string) $user->password, (string) $request->password);
            $shouldUpgradeLegacyPassword = $passwordIsValid;
        }

        if (!$passwordIsValid) {
            $this->logLoginAttempt(null, $request->email, 'failed', 'invalid_credentials', $request);
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->status !== 'active') {
            $this->logLoginAttempt($user->id, $user->email, 'failed', 'account_inactive', $request);
            return response()->json(['message' => 'Account is not active.'], 403);
        }

        if ($user->is_2fa_enabled) {
            if (!$otp) {
                $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $cacheKey = '2fa:' . $user->id;
                $hashed = hash('sha256', $code);
                Cache::put($cacheKey, $hashed, now()->addMinutes(5));

                $challengeId = Str::random(40);
                Cache::put(
                    '2fa_challenge:' . $challengeId,
                    [
                        'user_id' => $user->id,
                        'ip_address' => $request->ip(),
                    ],
                    now()->addMinutes(5)
                );

                Mail::to($user->email)->send(new TwoFactorCodeMail($code, 5));

                $this->logLoginAttempt($user->id, $user->email, 'pending', '2fa_required', $request);
                return response()->json([
                    'requires_2fa' => true,
                    'message' => 'Verification code sent.',
                    'user_id' => $user->id,
                    'challenge_id' => $challengeId,
                ], 202);
            }

            $challengeId = (string) $request->input('challenge_id', '');
            $challenge = Cache::get('2fa_challenge:' . $challengeId);
            if (
                !$challenge ||
                (int) ($challenge['user_id'] ?? 0) !== (int) $user->id ||
                (string) ($challenge['ip_address'] ?? '') !== (string) $request->ip()
            ) {
                $this->logLoginAttempt($user->id, $user->email, 'failed', 'invalid_2fa_challenge', $request);
                return response()->json(['message' => 'Invalid or expired verification session. Please sign in again.'], 422);
            }

            $cacheKey = '2fa:' . $user->id;
            $stored = Cache::get($cacheKey);
            if (!$stored || !hash_equals($stored, hash('sha256', $otp))) {
                $this->logLoginAttempt($user->id, $user->email, 'failed', 'invalid_otp', $request);
                return response()->json(['message' => 'Invalid verification code.'], 422);
            }
            Cache::forget($cacheKey);
            Cache::forget('2fa_challenge:' . $challengeId);
        }

        if ($shouldUpgradeLegacyPassword) {
            $user->password = Hash::make($request->password);
        }

        $token = $user->createToken('api')->plainTextToken;
        $user->last_login_at = now();
        $user->save();
        $this->logLoginAttempt($user->id, $user->email, 'success', 'login_success', $request);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 200);
    }

    private function logLoginAttempt(?int $userId, ?string $email, string $status, ?string $message, Request $request): void
    {
        try {
            DB::table('login_logs')->insert([
                'user_id' => $userId,
                'email' => $email,
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 512),
                'status' => $status,
                'message' => $message,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // ignore logging failures
        }
    }

    private function isPasswordHashed(string $password): bool
    {
        $info = Hash::info($password);
        return (int) ($info['algo'] ?? 0) !== 0;
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json(['message' => __($status)], 422);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|confirmed|min:8',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json(['message' => __($status)], 422);
    }
}
