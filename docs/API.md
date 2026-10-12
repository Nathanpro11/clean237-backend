# Clean237 API v3

Cette documentation couvre les routes v3 ajoutées au backend, en plus des routes existantes déjà validées par le frontend Flutter.

## Règles de calcul

- Une donnée est une alerte si `type === "alerte"`.
- Le statut d'une donnée est `"active"` ou `"traitee"` avec une valeur par défaut `"active"`.
- Le niveau d'une zone est calculé à partir des alertes actives :
  - score = min(10 x alertes actives, 100)
  - `critique` si score >= 80
  - `problématique` si score >= 60
  - `à surveiller` si score >= 40
  - `normal` sinon
- La sévérité d'une alerte est dérivée du niveau de la zone :
  - `critique` -> `critique`
  - `problématique` ou `à surveiller` -> `avertissement`
  - `normal` -> `info`
- Les alertes actives sont celles avec `statut: "active"`.

## Alertes

### GET /api/v1/alertes

Liste paginée des alertes depuis MongoDB.

Query params:
- `severite` : `critique | avertissement | info`
- `zoneId` : ObjectId de zone
- `statut` : `active | traitee`
- `search` : recherche sur description/source
- `page` : numéro de page, défaut `1`
- `limit` : défaut `10`

Exemple:

```http
GET /api/v1/alertes?zoneId=66d5f1a2c2b8d61c5e8e0001&statut=active&severite=critique&page=1&limit=10
```

Réponse type:

```json
{
  "message": "Alertes récupérées avec succès",
  "data": [
    {
      "_id": "66d5f1a2c2b8d61c5e8e0001",
      "titre": "Alerte · Mfoundi Centre",
      "sousTitre": "Signalement",
      "zoneId": "66d5f1a2c2b8d61c5e8e0001",
      "zoneNom": "Mfoundi Centre",
      "date": "2026-10-12T08:34:12.000Z",
      "severite": "critique",
      "statut": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET /api/v1/alertes/:id

Retourne une alerte unique. 404 si la donnée n'existe pas ou n'est pas de type `alerte`.

Exemple:

```http
GET /api/v1/alertes/66d5f1a2c2b8d61c5e8e0001
```

```json
{
  "message": "Alerte récupérée avec succès",
  "alerte": {
    "_id": "66d5f1a2c2b8d61c5e8e0001",
    "titre": "Alerte · Mfoundi Centre",
    "sousTitre": "Signalement",
    "zoneId": "66d5f1a2c2b8d61c5e8e0001",
    "zoneNom": "Mfoundi Centre",
    "date": "2026-10-12T08:34:12.000Z",
    "severite": "critique",
    "statut": "active"
  }
}
```

### PATCH /api/v1/alertes/:id/traiter

Passe l'alerte au statut `traitee`. L'opération est idempotente.

Exemple:

```http
PATCH /api/v1/alertes/66d5f1a2c2b8d61c5e8e0001/traiter
```

```json
{
  "message": "Alerte traitée avec succès",
  "alerte": {
    "_id": "66d5f1a2c2b8d61c5e8e0001",
    "titre": "Alerte · Mfoundi Centre",
    "sousTitre": "Signalement",
    "zoneId": "66d5f1a2c2b8d61c5e8e0001",
    "zoneNom": "Mfoundi Centre",
    "date": "2026-10-12T08:34:12.000Z",
    "severite": "critique",
    "statut": "traitee"
  }
}
```

## Zones détaillées

### GET /api/v1/zones/:id/details

Calcule la zone à partir des données MongoDB et renvoie le score, l'évolution, l'interprétation et les priorités.

Exemple:

```http
GET /api/v1/zones/66d5f1a2c2b8d61c5e8e0001/details
```

```json
{
  "message": "Détails de la zone récupérés avec succès",
  "zone": {
    "_id": "66d5f1a2c2b8d61c5e8e0001",
    "nom": "Mfoundi Centre",
    "score": 70,
    "niveau": "critique",
    "evolutionPoints": 10,
    "derniereMiseAJour": "2026-10-12T08:34:12.000Z",
    "evolution30Jours": [
      { "date": "2026-09-13T00:00:00.000Z", "score": 20 },
      { "date": "2026-09-14T00:00:00.000Z", "score": 30 }
    ],
    "alertCount": 7,
    "dataCount": 120,
    "interpretation": "Zone critique : 7 alertes actives. Intervention prioritaire recommandée.",
    "priorites": [
      "Planifier une collecte sous 24 h",
      "Traiter les 7 alertes actives"
    ]
  }
}
```

## Analyses par zone

### POST /api/v1/analyses/generate

Le corps accepte maintenant un champ optionnel `zoneId` pour filtrer les données sur une zone précise.

Exemple:

```http
POST /api/v1/analyses/generate
Content-Type: application/json

{
  "type": "zone_analyse",
  "zoneId": "66d5f1a2c2b8d61c5e8e0001",
  "periode": {
    "start": "2026-09-01T00:00:00.000Z",
    "end": "2026-10-12T00:00:00.000Z"
  }
}
```

Réponse type:

```json
{
  "message": "Analyse générée avec succès",
  "analyse": {
    "_id": "66d5f1a2c2b8d61c5e8e0002",
    "type": "zone_analyse",
    "zoneId": "66d5f1a2c2b8d61c5e8e0001",
    "zoneNom": "Mfoundi Centre",
    "periode": {
      "start": "2026-09-01T00:00:00.000Z",
      "end": "2026-10-12T00:00:00.000Z"
    },
    "resultat": "Analyse de 36 points de données ..."
  }
}
```

## Rapports

### POST /api/v1/rapports/generate

Le corps autorise `type`, `statut`, `format` et `zones` optionnels.

Exemple:

```http
POST /api/v1/rapports/generate
Content-Type: application/json

{
  "titre": "Rapport de suivi",
  "description": "Synthèse de la zone Mfoundi Centre",
  "analyseId": "66d5f1a2c2b8d61c5e8e0002",
  "type": "suivi",
  "format": "pdf",
  "statut": "pret"
}
```

### GET /api/v1/rapports

Filtres pris en charge : `statut`, `type`, `zoneId`, `search`, `page`, `limit`.

### PATCH /api/v1/rapports/:id/statut

```http
PATCH /api/v1/rapports/66d5f1a2c2b8d61c5e8e0003/statut
Content-Type: application/json

{
  "statut": "archive"
}
```

### GET /api/v1/rapports/:id/export?format=csv

Retourne un CSV UTF-8 avec BOM, séparateur `;` et un tableau des indicateurs.

```http
GET /api/v1/rapports/66d5f1a2c2b8d61c5e8e0003/export?format=csv
```

```csv
﻿Rapport;Rapport de suivi
Type;Nb points;Moyenne;Minimum;Maximum;Unité
alerte;18;12,50;1;62;unit
humidity;9;62,00;55;84;%
```

### GET /api/v1/rapports/:id/export?format=pdf

Comportement identique à `/api/v1/rapports/:id/pdf`.

## Dashboard

### GET /api/v1/dashboard

Le payload inclut maintenant la clé `alertesActives`.

```json
{
  "message": "Statistiques du tableau de bord récupérées avec succès",
  "dashboard": {
    "totalZones": 4,
    "totalDataPoints": 127,
    "dataByType": { "alerte": 22, "temperature": 41, "humidity": 31 },
    "totalAnalyses": 4,
    "analysesWithResult": 4,
    "totalReports": 3,
    "reportsWithStats": 3,
    "alertesActives": 7,
    "zonesCritiques": 1
  }
}
```
