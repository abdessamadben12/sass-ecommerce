<div id="auth-modal-backdrop" class="auth-modal-backdrop" style="display:none;" data-open-on-load="{{ ($errors->any() || session('two_factor_required')) ? '1' : '0' }}">
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div class="auth-modal-head">
            <div>
                <h3 id="auth-modal-title" class="auth-modal-title">Connexion</h3>
                <p class="auth-modal-subtitle">Accedez a votre compte pour continuer.</p>
            </div>
            <button id="close-auth-modal" type="button" class="auth-modal-close" aria-label="Fermer">&times;</button>
        </div>

        <div class="auth-modal-body">
            @if(session('status'))
                <p class="auth-status">{{ session('status') }}</p>
            @endif
            <div data-auth-view="login">
                <form method="POST" action="{{ route('login.submit') }}">
                    @method("POST")
                    @csrf
                    @if(session('two_factor_required') && old('challenge_id'))
                        <input type="hidden" name="challenge_id" value="{{ old('challenge_id') }}" />
                        <label class="auth-field-label">Code de verification</label>
                        <input class="auth-input" type="text" name="otp" inputmode="numeric" maxlength="6" placeholder="Entrez le code recu par email" required autofocus />
                    @else
                        <label class="auth-field-label">Adresse email</label>
                        <input class="auth-input" type="email" name="email" value="{{ old('email') }}" placeholder="exemple@email.com" required />

                        <label class="auth-field-label">Mot de passe</label>
                        <input class="auth-input" type="password" name="password" placeholder="Votre mot de passe" required />

                        <div class="auth-row">
                            <label style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" name="remember" value="1" />
                                Rester connecte
                            </label>
                            <button id="forgot-password-btn" type="button" class="underline">Mot de passe oublie ?</button>
                        </div>
                    @endif

                    @if($errors->any())
                        <p class="auth-error">{{ $errors->first() }}</p>
                    @endif

                    <button type="submit" class="auth-primary-btn">{{ session('two_factor_required') ? 'Verifier le code' : 'Se connecter' }}</button>
                </form>

                @if(!(session('two_factor_required') && old('challenge_id')))
                    <div class="auth-separator">OU</div>
                    <a href="{{ route('auth.google.redirect') }}" class="auth-social flex gap-4 justify-center items-center">
                        <div class="w-8 h-8">
                            <img src="/icons/google.svg" class="object-cover" alt="Login with Google">
                        </div>
                        Continuer avec Google
                    </a>
                    <p class="auth-legal-text">
                        En cliquant sur Se connecter, Continuer avec Google, Facebook, ou Apple, vous acceptez de respecter les Conditions d'utilisation et le Reglement concernant la confidentialite d'Etsy.
                        Etsy peut vous envoyer des messages ; vous pouvez modifier vos preferences a cet egard dans les parametres de votre compte. Nous ne publierons jamais sans votre autorisation.
                    </p>
                @endif
            </div>

            <div data-auth-view="forgot" class="auth-hidden">
                <p class="auth-forgot-title">Recuperation du mot de passe</p>
                <p class="auth-forgot-text">Entrez votre email pour recevoir un lien de reinitialisation.</p>
                <label class="auth-field-label">Adresse email</label>
                <input id="forgot-password-email" class="auth-input" type="email" placeholder="exemple@email.com" />
                <p id="forgot-password-feedback" class="auth-status auth-hidden"></p>
                <button id="forgot-password-submit" type="button" class="auth-primary-btn">Envoyer le lien</button>
                <button id="back-to-login-btn" type="button" class="auth-secondary-btn">Retour a la connexion</button>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('auth-modal-backdrop');
    if (!modal) return;

    var loginView = modal.querySelector('[data-auth-view="login"]');
    var forgotView = modal.querySelector('[data-auth-view="forgot"]');

    function showLogin() {
        if (!loginView || !forgotView) return;
        loginView.classList.remove('auth-hidden');
        forgotView.classList.add('auth-hidden');
    }

    function showForgot() {
        if (!loginView || !forgotView) return;
        loginView.classList.add('auth-hidden');
        forgotView.classList.remove('auth-hidden');
    }

    modal.addEventListener('click', function (e) {
        if (e.target.id === 'forgot-password-btn') {
            showForgot();
        }

        if (e.target.id === 'back-to-login-btn') {
            showLogin();
        }

        if (e.target.id === 'forgot-password-submit') {
            var emailInput = document.getElementById('forgot-password-email');
            var feedback = document.getElementById('forgot-password-feedback');
            if (!emailInput || !feedback) return;

            if (!emailInput.value.trim()) {
                feedback.textContent = 'Veuillez entrer une adresse email valide.';
                feedback.classList.remove('auth-hidden');
                return;
            }

            feedback.textContent = 'Si cet email existe, un lien de reinitialisation sera envoye.';
            feedback.classList.remove('auth-hidden');
        }
    });
});
</script>
