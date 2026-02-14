# Cahier des Charges - Dashboard Vendeur

Date: 11/02/2026
Projet: Marketplace
Version: 1.0

## 1. Contexte
Le dashboard vendeur est l'ecran principal de pilotage des activites d'un vendeur. Il doit afficher l'etat de son business en temps reel, ses priorites operationnelles et ses actions rapides.

## 2. Objectifs
- Donner une vision immediate de la performance commerciale.
- Aider le vendeur a traiter rapidement commandes, stock et support.
- Offrir des indicateurs fiables pour la prise de decision.

## 3. Perimetre
Inclus:
- KPIs ventes/commandes/revenus.
- Graphiques de performance.
- Tables operationnelles (commandes recentes, stock faible).
- Alertes metier.
- Actions rapides.

Exclus (phase 2):
- IA predictive avancee.
- Segmentation client complexe.
- Forecast multi-saisonnier.

## 4. Utilisateur cible
- Role: Vendeur authentifie.
- Prerequis: boutique active, au moins un produit publie.

## 5. Fonctionnalites attendues
### 5.1 Barre de filtres globale
- Periode: Aujourd'hui, 7 jours, 30 jours, Personnalisee.
- Filtre statut commande: toutes, pending, paid, processing, completed, canceled, refunded.
- Filtre boutique (si vendeur multi-boutiques).

### 5.2 KPIs principaux
Affichage en cartes:
- Chiffre d'affaires du jour.
- Chiffre d'affaires du mois.
- Nombre de commandes aujourd'hui.
- Commandes en attente de traitement.
- Produits actifs.
- Produits en rupture.
- Solde disponible.
- Retraits en attente.

Regles:
- KPI cliquable vers la page detail correspondante.
- Variation (%) vs periode precedente.
- Valeurs monetairees avec devise plateforme.

### 5.3 Graphiques
- Courbe revenus (J-30 / M-3): series ventes nettes, remboursements.
- Donut commandes par statut.
- Bar chart top 10 produits vendus (quantite + montant).

### 5.4 Blocs operationnels
- Dernieres commandes (table): numero, client, montant, statut, date, action.
- Stock faible: produit, stock restant, seuil, action reapprovisionner.
- Tickets recents: sujet, priorite, statut, date, action repondre.

### 5.5 Alertes metier
- Produit refuse par moderation.
- Taux de remboursement anormal.
- Stock critique.
- Echec de retrait/paiement.

### 5.6 Actions rapides
- Ajouter un produit.
- Creer une promotion.
- Demander un retrait.
- Ouvrir rapport complet.

## 6. Regles metier
- Le CA net = paiements valides - remboursements valides.
- Les commandes annulees ne comptent pas dans ventes nettes.
- Une commande est "a traiter" si statut = paid/processing non finalisee.
- Un produit est "stock faible" si stock <= seuil_min.

## 7. Exigences UX/UI
- Responsive mobile/tablette/desktop.
- Aucune barre de scroll horizontale sur la page.
- Chargement progressif: skeleton sur cartes et charts.
- Etats vides explicites (aucune commande, aucun produit, etc.).
- Messages d'erreur compr�hensibles + bouton "Reessayer".

## 8. Exigences techniques
- Front: laravel  (cards, charts, table).
- API: endpoints agreges pour limiter les appels multiples.
- Performance:
  - TTFB API dashboard < 500 ms (objectif).
  - Chargement dashboard complet < 2.5 s sur 4G.
- Cache:
  - Cache court (30 a 60s) sur metriques agreg�es.
  - Invalidation apres changement statut commande critique.

## 9. Securite
- Acces strict role vendeur.
- Validation serveur de tous les filtres.
- Journalisation des actions critiques (retrait, changement statut).
- Protection CSRF et controle token session.

## 10. API minimales (contrat)
- `GET /seller/dashboard/summary?from=&to=&status=`
- `GET /seller/dashboard/revenue-chart?from=&to=`
- `GET /seller/dashboard/orders-by-status?from=&to=`
- `GET /seller/dashboard/top-products?from=&to=&limit=10`
- `GET /seller/dashboard/recent-orders?page=&per_page=`
- `GET /seller/dashboard/low-stock?page=&per_page=`
- `GET /seller/dashboard/recent-tickets?page=&per_page=`

## 11. Schema de donnees retour (resume)
`summary`:
- `revenue_today`
- `revenue_month`
- `orders_today`
- `orders_pending`
- `products_active`
- `products_out_of_stock`
- `balance_available`
- `withdrawals_pending`
- `currency`

`revenue_chart`:
- `labels[]`
- `net_sales[]`
- `refunds[]`

`top_products[]`:
- `product_id`
- `name`
- `qty_sold`
- `amount`

## 12. Criteres d'acceptation
- Tous les KPIs affichent une valeur coherente avec la base.
- Les filtres modifient toutes les sections du dashboard.
- Les actions rapides redirigent vers les bonnes pages.
- Le dashboard reste utilisable sur ecran 360px de large.
- En cas d'erreur API, la page reste stable et recuperable.

## 13. Plan de livraison
MVP (Sprint 1):
- KPIs + revenu chart + commandes recentes + actions rapides.

Sprint 2:
- Top produits + stock faible + tickets recents + alertes.

Sprint 3:
- Optimisation perf, monitoring et tests E2E complets.

## 14. Livrables
- Ecran dashboard vendeur complet responsive.
- Endpoints backend documentes.
- Jeux de tests (unitaires + integration + E2E parcours critique).
- Note de recette fonctionnelle.
