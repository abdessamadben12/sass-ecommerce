# Cahier des Charges - Fonctionnalites Vendeur & Client

Date: 11/02/2026
Projet: Marketplace (frontend + backend)

## 1. Objectif
Definir les fonctionnalites fonctionnelles et techniques des espaces **Vendeur** et **Client** afin de livrer une experience complete, securisee et performante.

## 2. Perimetre
- Espace **Client**: navigation, achat, paiement, suivi commandes, compte utilisateur.
- Espace **Vendeur**: gestion boutique, produits, commandes, revenus, support.
- Integrations: authentification, paiement, notifications, rapports.

## 3. Roles et droits
### 3.1 Client
- Creer un compte, se connecter, mot de passe oublie, 2FA (si active).
- Consulter produits, ajouter au panier, payer, suivre commande.
- Gerer profil, adresses, moyens de paiement (si autorise), tickets support.

### 3.2 Vendeur
- Creer/modifier boutique.
- Creer/modifier/supprimer produits.
- Recevoir/traiter commandes.
- Suivre ventes, commissions, retraits.
- Repondre aux tickets lies a ses commandes/produits.

## 4. Fonctionnalites Client
### 4.1 Authentification
- Inscription avec verification email.
- Connexion securisee + captcha + 2FA optionnel.
- Gestion session (token) + deconnexion.

### 4.2 Catalogue et recherche
- Liste produits avec filtres: categorie, prix, note, popularite.
- Recherche texte avec tri (prix asc/desc, recents, meilleures ventes).
- Page detail produit: media, description, stock, vendeur, avis.

### 4.3 Panier et checkout
- Ajouter/supprimer/modifier quantite.
- Calcul total: sous-total, remises, taxes, frais.
- Validation stock avant paiement.
- Paiement avec etat transaction (pending/success/failed).

### 4.4 Commandes
- Historique des commandes.
- Statut: en attente, payee, en traitement, expediee/livree (selon type).
- Detail commande avec facture/recapitulatif.

### 4.5 Espace compte
- Profil, mot de passe, avatar.
- Carnet d'adresses.
- Notifications et preferences communication.

### 4.6 Support
- Creation ticket.
- Reponses, pieces jointes, statut ticket.

## 5. Fonctionnalites Vendeur
### 5.1 Onboarding vendeur
- Demande d'ouverture boutique.
- Validation par admin (KYC si requis).
- Activation compte vendeur.

### 5.2 Gestion boutique
- Nom, logo, banniere, description.
- Parametres livraison/retour (si applicable).
- Statut boutique (active/suspendue).

### 5.3 Gestion produits
- CRUD produit.
- Champs: titre, slug, categorie, prix, stock, description, media, fichiers.
- Statut produit: brouillon, en attente validation, publie, refuse.
- Import/export (phase 2).

### 5.4 Gestion commandes
- Liste commandes par statut.
- Detail commande et client (infos necessaires uniquement).
- Actions: accepter, traiter, marquer complete.
- Historique des actions (audit).

### 5.5 Finance vendeur
- Tableau revenus (jour/semaine/mois).
- Commissions appliquees.
- Solde disponible.
- Demande de retrait + historique.

### 5.6 Analytics vendeur
- Top produits vendus.
- Taux conversion panier -> achat.
- Revenus par periode.

### 5.7 Support vendeur
- Tickets recues des clients pour ses ventes.
- Reponse et escalation admin.

## 6. Regles metier
- Un produit non valide par admin ne peut pas etre vendu.
- Verifier le stock au moment du paiement.
- Une commande payee ne peut pas etre supprimee.
- Les remboursements suivent une politique configurable.
- Les commissions sont configurees par l'admin.

## 7. Exigences non fonctionnelles
- Performance: pages principales < 2.5s sur reseau standard.
- Securite: captcha login, protection CSRF, validation serveur stricte.
- Disponibilite: gestion erreurs API + retries limites.
- UX responsive: mobile/tablette/desktop.
- Journalisation: logs actions critiques (paiement, retrait, statut commande).

## 8. API (minimum attendu)
### Client
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /products`, `GET /products/{id}`
- `POST /cart/items`, `PUT /cart/items/{id}`, `DELETE /cart/items/{id}`
- `POST /checkout`
- `GET /orders`, `GET /orders/{id}`
- `POST /tickets`, `GET /tickets`, `POST /tickets/{id}/reply`

### Vendeur
- `GET /seller/dashboard`
- `GET /seller/products`, `POST /seller/products`, `PUT /seller/products/{id}`, `DELETE /seller/products/{id}`
- `GET /seller/orders`, `GET /seller/orders/{id}`, `PUT /seller/orders/{id}/status`
- `GET /seller/earnings`, `GET /seller/withdrawals`, `POST /seller/withdrawals`

## 9. Ecrans minimum (MVP)
### Client
- Login/Register/Forgot password
- Home marketplace + listing produits
- Product detail
- Panier
- Checkout
- Mes commandes
- Mon compte
- Support tickets

### Vendeur
- Dashboard vendeur
- Mes produits (liste + formulaire)
- Mes commandes
- Revenus et retraits
- Parametres boutique
- Tickets support

## 10. Criteres d'acceptation (exemples)
- Un client peut finaliser un achat et voir la commande dans son historique.
- Un vendeur peut publier un produit et voir ses ventes dans son dashboard.
- Les erreurs de paiement sont gerees avec message clair et pas de double debit.
- Toutes les pages critiques sont responsives sans debordement horizontal.

## 11. Priorisation
### Phase MVP
- Auth, catalogue, panier, checkout, commandes client.
- CRUD produits vendeur, commandes vendeur, revenus de base.

### Phase 2
- Coupons avances, recommandations, export donnees, analytics avances.
- Notifications temps reel et automatisations marketing.

## 12. Livrables
- Frontend complet Client + Vendeur.
- API backend correspondante + documentation endpoints.
- Tests: unitaires, integration API, parcours E2E critiques.
- Rapport de recette fonctionnelle.

## 13. Risques et points d'attention
- Cohérence des statuts commande/paiement entre modules.
- Concurrence stock lors des pics de commandes.
- Qualite des donnees (categories, medias produits).
- Latence APIs rapports/analytics.
