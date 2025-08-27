# Contributing (Almanac Server)

Welcome! This document explains how we work on the **Almanac Server** repo.

## Quick Start

```bash
npm install
cp .env.example .env   # fill values
npm run dev            # start locally (nodemon)
```

### Useful Scripts

```bash
npm run lint        # eslint
npm run test        # unit/integration tests
npm run build       # transpile or tsc --noEmit check
npm run start       # start production build
```

### Environment Variables

Create `.env` using `.env.example` as a template. Typical keys:

```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
UNSPLASH_ACCESS_KEY=...
NODE_ENV=development
```

## Branching & Deploy (Summary)

We keep **main** always deployable. See the full playbook in `docs/branching-deploy-playbook.md`.

- **main** → production deploy
- **dev** → staging deploy
- **feat/\*** → features from `dev`
- **fix/\*** → small fixes from `dev`
- **exp/\*** → spikes
- **hotfix/\*** → urgent fixes from `main`

### Standard Flow

1. Branch off `dev`:
   ```bash
   git checkout dev && git pull
   git checkout -b feat/<name>
   ```
2. Commit/push, open PR → `dev` (CI must pass).
3. Staging tests on `dev`.
4. PR `dev → main` for production release.

### Hotfix

```bash
git checkout main && git pull
git checkout -b hotfix/<name>
# fix -> PR main -> merge -> deploy
git checkout dev && git pull
git merge main && git push
```

## API Notes

- Routes live in `routes/`
- Controllers in `controllers/`
- Models in `models/`
- Shared helpers in `utils/`
- Middleware in `middleware/`

### Response Shape

We standardize success/error with helpers in `utils/respond.js`.

- Success: `{ ok: true, data }`
- Error: `{ ok: false, code, message }` with appropriate HTTP status

## Code Style

- ESLint + Prettier
- Conventional commits recommended:
  - `feat(server): add /events/upcoming`
  - `fix(events): populate plant in getEvent`
  - `refactor(routes): split admin routes`

## CI

PRs must pass:

```bash
npm run lint
npm test
npm run build   # or tsc --noEmit
```

## Deploy

- **main** → Production service (Render/Fly/Railway)
- **dev** → Staging service
  Use separate DBs and secrets per environment.

## Questions

Ping Harry (ChatGPT) in the project notes for guidance, or check `docs/branching-deploy-playbook.md`.
