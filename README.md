# ClinicFlow

Application PERN (PostgreSQL, Express, React, Node) de gestion de patients et de rendez-vous pour une petite clinique.

- `db/` : schéma (`init.sql`) et données de test (`seed.sql`)
- `backend/` : API REST Express (routes / controllers / services / middlewares / validators)
- `frontend/` : React + Vite
- `docs/conception.md` : ERD et justification des relations

## Lancement rapide (Docker)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:4000/api |
| PostgreSQL | localhost:5432 (clinicflow / clinicflow) |

Le schéma et le seed sont exécutés automatiquement au **premier** démarrage de Postgres. Pour réinitialiser la base :

```bash
docker compose down -v && docker compose up --build
```

## Comptes de test

Mot de passe pour tous : **`password123`**

| Email | Rôle |
|---|---|
| admin@clinicflow.com | admin |
| staff1@clinicflow.com | staff |
| staff2@clinicflow.com | staff |

## Lancement sans Docker

Prérequis : Node 20+, PostgreSQL 14+.

```bash
# Base de données
createdb clinicflow
psql -d clinicflow -f db/init.sql
psql -d clinicflow -f db/seed.sql

# Backend
cd backend
cp .env.example .env   # adapter DATABASE_URL
npm install
npm run dev

# Frontend (autre terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Variables d'environnement

**backend/.env**

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port de l'API | `4000` |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL | `postgres://clinicflow:clinicflow@localhost:5432/clinicflow` |
| `JWT_SECRET` | Secret de signature des JWT | `change-me-in-production` |
| `JWT_EXPIRES_IN` | Durée de validité du token | `8h` |
| `CORS_ORIGIN` | Origine autorisée | `http://localhost:5173` |

**frontend/.env**

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de base de l'API | `http://localhost:4000/api` |

## API

Toutes les routes (sauf login) exigent `Authorization: Bearer <token>`.

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authentifié |
| GET | `/api/dashboard/stats` | authentifié |
| POST | `/api/patients` | authentifié |
| GET | `/api/patients?search=&page=&limit=` | authentifié |
| GET | `/api/patients/:id` | authentifié |
| PUT | `/api/patients/:id` | authentifié |
| DELETE | `/api/patients/:id` | **admin** (soft delete) |
| POST | `/api/appointments` | authentifié |
| GET | `/api/appointments?date=&status=&patientId=&page=&limit=` | authentifié |
| PATCH | `/api/appointments/:id/status` | authentifié |

Codes d'erreur : `400` validation (Zod), `401` non authentifié, `403` rôle insuffisant, `404` introuvable, `409` conflit (CIN déjà utilisée, RDV confirmé à moins de 30 min), `500` erreur serveur. Format : `{ "error": { "message", "details" } }`.

## Choix techniques

- **Sécurité** : mots de passe hashés en bcrypt (`bcryptjs`, implémentation JS pure, compatible `$2a$`/`$2b$`, sans compilation native dans l'image Docker), JWT signé HS256, `helmet`, CORS restreint, requêtes SQL paramétrées.
- **Règle des 30 min** : contrôlée dans le service (409) **et** par une contrainte `EXCLUDE` PostgreSQL (protection contre la concurrence). Voir `docs/conception.md`.
- **Performance** : pagination `LIMIT/OFFSET`, index sur les colonnes de recherche et de filtre.
- **Soft delete** des patients via `deleted_at`.
- Les dates « du jour » sont calculées dans le fuseau de la base (UTC dans Docker).
