# Rapport - Templates et Variables (Facture / Invoice)

Date: 11/02/2026
Perimetre: Templates backend + integration facture de paiement

## 1. Resume
Le projet supporte les templates dynamiques via Twig (backend `TemplateService`).
Le type `invoice` est adapte aux factures de paiement avec variables structurees (invoice, client, company, items).

## 2. Templates disponibles (etat actuel)
- `email_welcome` (email)
- `invoice` (facture)

Important:
- Les templates `invoice` ne sont pas utilises dans Email Marketing (normal).
- Les templates `invoice` sont utilises pour rendu facture / PDF.

## 3. Variables supportees pour `invoice`
Le service backend construit les variables dans `renderInvoice()`:

### 3.1 Bloc `invoice`
- `{{ invoice.id }}`
- `{{ invoice.number }}`
- `{{ invoice.date }}`
- `{{ invoice.due_date }}`
- `{{ invoice.subtotal }}`
- `{{ invoice.tax_rate }}`
- `{{ invoice.tax_amount }}`
- `{{ invoice.total }}`
- `{{ invoice.notes }}`

### 3.2 Bloc `company`
- `{{ company.name }}`
- `{{ company.logo_url }}`
- `{{ company.address }}`
- `{{ company.phone }}`
- `{{ company.email }}`
- `{{ company.legal_text }}`

### 3.3 Bloc `client`
- `{{ client.name }}`
- `{{ client.address }}`
- `{{ client.city }}`
- `{{ client.postal_code }}`
- `{{ client.vat_number }}`

### 3.4 Liste `items`
- `{{ item.description }}`
- `{{ item.quantity }}`
- `{{ item.unit_price }}`
- `{{ item.total }}`

### 3.5 Variables globales
- `{{ current_date }}`
- `{{ current_year }}`
- `{{ current_time }}`
- `{{ app.name }}`
- `{{ app.url }}`

## 4. Exemple Twig pour lignes de facture
```twig
<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Qte</th>
      <th>Prix unitaire</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    {% for item in items %}
      <tr>
        <td>{{ item.description }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.unit_price }}</td>
        <td>{{ item.total }}</td>
      </tr>
    {% endfor %}
  </tbody>
</table>
```

## 5. Filtres Twig disponibles
- `|currency` (format prix)
- `|date` (format date)
- `|upper` (majuscules)

Exemple:
```twig
{{ invoice.total|currency('EUR') }}
{{ invoice.date|date('d/m/Y') }}
{{ client.name|upper }}
```

## 6. Endpoints templates utiles
- `GET /admin/templates/get-templates`
- `POST /admin/templates/create-template`
- `PUT /admin/templates/update-template/{id}`
- `DELETE /admin/templates/delete-template/{id}`
- `GET /admin/templates/{template}`
- `GET /admin/templates/{template}/preview`
- `POST /admin/templates/{template}/render`

## 7. Bonnes pratiques
1. Garder `type=invoice` pour factures et `type=email_*` pour emails.
2. Utiliser des noms de variables stables (`invoice.total`, `client.name`).
3. Eviter HTML invalide dans le contenu template.
4. Tester via `preview` avant envoi/export PDF.

## 8. Checklist de validation
- Le template est bien de type `invoice`.
- Le rendu affiche correctement les blocs `invoice`, `client`, `company`.
- La boucle `items` fonctionne.
- Les champs vides n'affichent pas `{{...}}` non remplaces.
- Le PDF se genere sans erreur.

## 9. Conclusion
La gestion des variables facture est bien supportee. Le systeme est pret pour des templates de paiement/facture dynamiques, avec preview et rendu final.
