# 🚀 Guide de Contribution Git – Projet Clean237 Backend

Ce document explique les règles de travail en équipe pour développer sur l'API backend de **Clean237**. Merci de lire attentivement ces consignes avant d'écrire du code !

---

## 📌 Les 3 Règles d'Or

1. **Interdiction de commiter directement sur la branche `main`.** Tout le monde travaille sur une branche secondaire.
2. **Chacun dans son module.** Vous devez écrire votre code métier uniquement dans le dossier attribué dans `src/modules/<votre-module>/`.
3. **Communication sur les fichiers partagés.** Si vous devez installer un package npm (`package.json`) ou modifier `src/app.ts`, prévenez l'équipe sur votre canal de discussion.

---

## 🛠️ Naming des branches par module

Avant de démarrer, repérez le nom de branche qui correspond à votre module :

| Module | Nom de la branche Git |
| :--- | :--- |
| **Gestion de l'Administration** | `feature/administration` |
| **Gestion des Agents de Commande** | `feature/agents-commande` |
| **Gestion de la Géolocalisation** | `feature/geolocalisation` |
| **Notifications & Signalements** | `feature/notifications-signalements` |
| **Gestion des Utilisateurs** | `feature/utilisateurs` |

---

## 🔄 Workflow au quotidien (Étape par étape)

### Étape 1 : Récupérer le projet la première fois

```bash
# 1. Cloner le dépôt sur votre machine
git clone git@github.com:Nathanpro11/clean237-backend.git
cd clean237-backend

# 2. Installer les dépendances
npm install

# 3. Créer votre fichier d'environnement local
cp .env.example .env
```

---

### Étape 2 : Créer sa branche de travail

Toujours repartir de la branche `main` à jour avant de créer sa branche de fonctionnalité :

```bash
# Se placer sur la branche main
git checkout main

# Mettre à jour la branche main avec GitHub
git pull origin main

# Créer et basculer sur votre branche de module (ex: utilisateurs)
git checkout -b feature/utilisateurs
```

---

### Étape 3 : Travailler dans son module

Écrivez vos fichiers uniquement dans le dossier correspondant à votre module (`src/modules/<votre-module>/`).

**Structure type d'un module :**
```text
src/modules/utilisateurs/
├── utilisateurs.controller.ts
├── utilisateurs.routes.ts
├── utilisateurs.service.ts
└── utilisateurs.types.ts
```

---

### Étape 4 : Valider et envoyer vos modifications

Une fois qu'une fonctionnalité ou correction est prête :

```bash
# 1. Vérifier les fichiers modifiés
git status

# 2. Ajouter vos modifications
git add .

# 3. Créer le commit avec un message clair
git commit -m "feat(utilisateurs): ajout du contrôleur de création de compte"

# 4. Envoyer votre branche sur GitHub
git push origin feature/utilisateurs
```

---

### Étape 5 : Créer une Pull Request (PR) sur GitHub

1. Rendez-vous sur la page GitHub du projet : `https://github.com/Nathanpro11/clean237-backend`
2. Cliquez sur le bouton jaune **"Compare & pull request"** qui apparaît.
3. Donnez un titre clair à votre PR (ex: `[Utilisateurs] Implémentation des routes d'inscription`).
4. Demandez une relecture (Review) à un ou deux collègues de l'équipe.
5. Une fois validée, la PR sera fusionnée (Merged) dans la branche `main`.

---

### Étape 6 : Maintenir sa branche à jour avec `main`

Pendant que vous travaillez, d'autres développeurs vont fusionner leur code sur `main`. Pour récupérer leurs nouveautés et éviter des conflits :

```bash
# 1. Revenez sur main et mettez-la à jour
git checkout main
git pull origin main

# 2. Retournez sur votre branche
git checkout feature/utilisateurs

# 3. Fusionnez les nouveautés de main dans votre branche
git merge main
```

---

## ⚠️ Attention aux zones partagées

* **`package.json`** : Si vous installez un package (`npm install xxx`), faites-le savoir sur le groupe de l'équipe afin que les autres exécutent `npm install` de leur côté.
* **`src/app.ts`** : N'ajoutez que la ligne d'importation et d'enregistrement de la route relative à **votre** module.