# Architecture Laravel Complete (Based On Current Database)

## 1. Objectif
Cette architecture est adaptee a votre base actuelle pour:
- Home page dynamique
- Listing produits
- Commandes et paiements securises
- Gestion admin/seller/buyer
- Marketing, support, logs, settings

Elle est concue pour Laravel (Blade + API), sans dependre de React.

---

## 2. Domaines metier (modules)

### 2.1 Auth / IAM
Tables:
- `users`
- `user_detaills`
- `wallets`
- `login_logs`
- `personal_access_tokens`

Roles:
- `admin`
- `seller`
- `buyer`

Regles:
- Seul `admin` accede aux routes admin
- `seller` gere shop/produits/revenus
- `buyer` passe commandes et paiements

### 2.2 Catalogue
Tables:
- `categories`
- `shops`
- `products`
- `licenses`
- `product_settings`
- `product_formats`
- `product_views`
- `product_downloads`
- `product_reviews`

Regles:
- 1 seller -> 1 shop (dans votre schema actuel)
- 1 shop -> N produits
- 1 categorie -> N produits
- Publication produit via statut (`draft`, `pending`, `approved`, `rejected`, `supended`)

### 2.3 Orders / Commerce
Tables:
- `orders`
- `order_items`
- `invoices`
- `invoice_items`
- `profits`

Regles:
- `orders` porte le statut global
- `order_items` porte les lignes de produits
- Le calcul de revenus/profits part de `order_items (quantity * price)`

### 2.4 Finance / Paiement
Tables:
- `payments`
- `transactions`
- `deposits`
- `withdrawals`
- `wallets`
- `commission_settings`

Regles:
- `transactions` est le registre central des mouvements (+/-)
- `deposits` et `withdrawals` alimentent les wallets
- `payments` doit etre confirme par webhook signe

### 2.5 Marketing
Tables:
- `subscribers`
- `promotions` + tables cibles
- `coupons` + tables cibles + `coupon_redemptions`
- `campaigns` + `campaign_sends`
- `referral_codes`, `referral_invites`, `referral_rewards`
- `templates`

### 2.6 Support / Notification
Tables:
- `tickets`
- `ticket_replies`
- `notifications`
- `alerts`

### 2.7 Settings
Tables:
- `settings`
- `payment_settings`
- `email_settings`
- `commission_settings`
- `storage_settings`

### 2.8 Audit
Tables:
- `activity_log`
- `admin_logs`
- `failed_jobs`
- `login_logs`

---

## 3. Relations coeur (resume)
- `users (seller) -> shops -> products`
- `orders -> order_items -> products`
- `orders -> user (buyer)`
- `users -> wallets -> transactions`
- `users -> deposits / withdrawals`
- `orders + commission_settings -> profits`
- `settings*` pilotent la config applicative

---

## 4. Structure dossier recommandee (Laravel)

```text
app/
  Domain/
    Auth/
      Services/
      Actions/
      DTO/
    Catalog/
      Models/
      Repositories/
      Services/
      Actions/
      Policies/
    Orders/
      Models/
      Repositories/
      Services/
      Actions/
      Policies/
    Finance/
      Models/
      Repositories/
      Services/
      Actions/
      Policies/
    Marketing/
      Models/
      Repositories/
      Services/
      Actions/
    Support/
      Models/
      Repositories/
      Services/
      Actions/
    Settings/
      Services/
      Actions/
    Audit/
      Services/
      Listeners/
  Http/
    Controllers/
      Api/
        Admin/
        Seller/
        Buyer/
        Public/
    Requests/
    Middleware/
  Jobs/
  Events/
  Listeners/
```

---

## 5. Flows critiques

### 5.1 Home page
1. Charger categories + produits featured (cache 5-15 min)
2. Afficher sections dynamiques
3. Ajouter tracking views (`product_views`)

### 5.2 Listing produits
1. Filtres: search, category, price, sort
2. Query server-side paginee
3. Retour avec metadata de pagination

### 5.3 Checkout securise
1. Creer `order` en `pending`
2. Inserer `order_items`
3. Creer session/intention chez provider
4. Rediriger user vers provider
5. Webhook signe recu
6. Verifier signature + idempotency
7. Mettre `order -> paid`
8. Ecrire `payments`, `transactions`, `profits`

Important:
- Ne jamais marquer `paid` via `success_url` frontend.
- Validation uniquement via webhook provider.

### 5.4 Distribution des profits
Formule:
- `gross = sum(order_items.quantity * order_items.price)` (vendeur)
- `platform = gross * platform_percent / 100`
- `seller = gross - platform`

Statuts conseilles pour calcul:
- `paid`, `shipped`, `completed`

### 5.5 Withdrawal seller
1. Seller demande retrait (pending)
2. Admin approuve/rejette
3. Si approuve: debit wallet + transaction `-` + statut `approved`

---

## 6. Services metier a standardiser
- `CatalogService`
- `CheckoutService`
- `PaymentServiceInterface` (Stripe/PayPal/... adapters)
- `WebhookService`
- `WalletService`
- `ProfitService`
- `SettingsService`
- `ActivityLogService`

---

## 7. Securite
- HTTPS obligatoire
- Validation FormRequest sur toutes les entrees
- Middleware role-based: `admin`, `seller`, `buyer`
- Rate limit sur login, checkout, webhook
- Signature webhook + replay protection
- Idempotency key sur paiement
- Journaliser toutes actions admin mutables

---

## 8. API routing conseille
- `routes/api/admin.php`
- `routes/api/seller.php`
- `routes/api/buyer.php`
- `routes/api/public.php`

Puis inclure ces fichiers dans `routes/api.php`.

---

## 9. Jobs / async
- `SendOrderEmailJob`
- `SendCampaignJob`
- `HandlePaymentWebhookJob`
- `GenerateInvoicePdfJob`

Utiliser `failed_jobs` + retry policies.

---

## 10. Plan de refactor en 5 phases

### Phase 1
- Stabiliser controllers actuels
- Ajouter FormRequests manquants
- Normaliser statuses et validations

### Phase 2
- Introduire Services metier (catalog, checkout, wallet, profit)
- Controller minces, logique dans services

### Phase 3
- Ajouter Events/Listeners pour email + audit + notifications
- Passer les operations lourdes en Jobs

### Phase 4
- Refactor routes par domaine (admin/seller/buyer/public)
- Appliquer policies + permissions par ressource

### Phase 5
- Observabilite complete:
  - audit enrichi
  - traces paiement/webhook
  - alerting erreurs critiques

---

## 11. Points d'attention specifiques a votre schema
- `shops.user_id` est `unique`: un seller = un shop.
- `products.status` contient `supended` (typo historique): garder coherence applicative.
- `transactions` polymorphiques: ideal pour relier order/deposit/withdraw/payment.
- Settings SEO deja en place: `robots`, `robots_url`, `sitemap_url`.

---

## 12. Resultat attendu
Avec cette architecture:
- Home/listing rapides et maintainables
- Paiement robuste et securise
- Profit vendeur fiable et tracable
- Admin dashboard auditable et evolutif
- Base propre pour scaler sans regressions

