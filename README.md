# Kofry — Espace Personnel d'Épargne par Objectifs

Kofry est une application web progressive (**Progressive Web App - PWA**) conçue pour un **usage strictement privé et personnel**. Elle permet à son unique propriétaire de créer, organiser, suivre et alimenter autant de coffres d'épargne qu'il le souhaite afin d'atteindre ses projets personnels en toute sérénité.

Kofry n'est **pas** une plateforme fintech publique :
- Aucun système d'inscription publique ni bouton « Créer un compte » visiteur ;
- Aucun quota ni limitation du nombre de coffres (création 100% gratuite et illimitée) ;
- **Aucun taux d'intérêt, aucun rendement, aucun frais à l'échéance ni pénalité de retrait**.

---

## 1. Principes et Règles Métier

1. **Coffres par objectif** : Chaque coffre correspond à un projet (ex : *Achat Ordinateur*, *Fonds d'urgence*, *Voyage*).
2. **Minimum quotidien par coffre** : Chaque coffre définit son propre montant minimal quotidien.
   - Si un dépôt est inférieur au minimum configuré pour ce coffre : **dépôt strictement rejeté** avec message explicatif (*« Le montant est inférieur au minimum quotidien de ce coffre : X FCFA. »*).
3. **Retraits sans frais** : Retrait possible avant, pendant ou après la date cible, avec **0 FCFA de frais**, aucune pénalité et aucune commission.
4. **Idempotence absolue des opérations Mobile Money** : Une même demande de dépôt ou de webhook reçu plusieurs fois ne crédite le coffre qu'une seule et unique fois grâce à la clé d'idempotence (`kofry:deposit:...` / `kofry:withdrawal:...`).
5. **Devise exclusive** : Le **FCFA** (formaté avec espaces, ex : `2 000 FCFA`, `350 000 FCFA`).
6. **Langue** : 100% en **français**.

---

## 2. Structure du Projet

```text
kofry/
├── index.html                   # Entrée HTML principale (balises PWA, titres français)
├── metadata.json                # Métadonnées applicatives
├── package.json                 # Dépendances Vite, React, Tailwind CSS, PWA
├── requirements.txt             # Dépendances Python / Django
├── README.md                    # Documentation complète en français
├── vite.config.ts               # Configuration bundler Vite & plugin PWA
│
├── src/                         # Application interactive PWA (React / TypeScript)
│   ├── main.tsx                 # Point d'entrée React
│   ├── App.tsx                  # Architecture globale et routage interne
│   ├── types.ts                 # Définitions TypeScript (Coffre, Transaction, etc.)
│   ├── components/
│   │   ├── LoginView.tsx        # Écran 1 : Connexion privée pour le propriétaire
│   │   ├── DashboardView.tsx    # Écran 2 : Tableau de bord principal consolidé
│   │   ├── CoffreCard.tsx       # Carte individuelle d'un coffre
│   │   ├── CoffreDetailView.tsx # Détail du coffre (dépôts & retraits contrôlés)
│   │   ├── CoffreModal.tsx      # Création et modification 100% gratuite
│   │   ├── HistoriqueView.tsx   # Historique complet des transactions
│   │   ├── JournalView.tsx      # Audit chronologique immuable des activités
│   │   ├── ParametresView.tsx   # Paramètres & simulateur d'idempotence Mobile Money
│   │   ├── PWAInstallButton.tsx # Bouton d'installation PWA et guide iOS Safari
│   │   └── OfflineIndicator.tsx # Détection du mode hors ligne
│   └── services/
│       └── kofryEngine.ts       # Moteur métier, transactions atomiques, idempotence
│
└── django_backend/              # Architecture backend Django de référence
    ├── manage.py
    └── savings/
        ├── models.py            # Modèles Django (Coffre, Transaction, JournalActivite)
        ├── services.py          # Services bancaires atomiques & idempotence
        ├── tests.py             # Tests unitaires validant toutes les règles métier
        └── admin.py             # Interface Django Admin sécurisée
```

---

## 3. Prérequis

- **Node.js** : version 18+ (recommandé 20+)
- **Python** : version 3.10, 3.11 ou 3.12 (pour le backend Django)
- **Navigateur moderne** : Chrome, Safari, Edge ou Firefox supportant les PWA.

---

## 4. Lancement de l'Application Interactive (React / PWA)

L'application web PWA est immédiatement opérationnelle et s'exécute localement :

```bash
# 1. Installation des dépendances npm
npm install

# 2. Lancement du serveur de développement (port 3000)
npm run dev
```

Ouvrez ensuite votre navigateur sur `http://localhost:3000`.

### Identifiants d'accès préconfigurés pour le propriétaire
- **Identifiant** : `nanga`
- **Mot de passe** : `kofry2026`

---

## 5. Lancement du Backend Django (Alternative Python)

Si vous souhaitez exécuter le backend Django autonome :

```bash
# 1. Création de l'environnement virtuel Python
python -m venv .venv

# 2. Activation de l'environnement virtuel
# Sur Linux / macOS :
source .venv/bin/activate
# Sur Windows :
.venv\Scripts\activate

# 3. Installation des dépendances Python
pip install -r requirements.txt

# 4. Exécution des migrations
python django_backend/manage.py migrate

# 5. Création du compte propriétaire
python django_backend/manage.py createsuperuser

# 6. Exécution des tests unitaires (règles d'idempotence, minimum quotidien, retraits)
python django_backend/manage.py test savings

# 7. Lancement du serveur Django
python django_backend/manage.py runserver
```

---

## 6. Fonctionnalités PWA

- **Manifeste Web** (`manifest.webmanifest`) conforme aux normes Chromium et iOS.
- **Service Worker** avec mise en cache locale des ressources statiques.
- **Installation en 1 clic** sur Android/Desktop et guide interactif étape par étape pour **iOS Safari**.
- **Indicateur de connectivité** informant en temps réel en cas de passage hors ligne.
- Palette de couleurs institutionnelle : **Pine Green** (`#1C4A3E`), **Mint** (`#E8F2EE`), **Succès** (`#10B981`), **Erreur** (`#EF4444`).
