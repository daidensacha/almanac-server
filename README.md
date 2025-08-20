![](/images/mockup1.jpg)

# Almanac Server

## Overview

**Garden Almanac (Server)** — Express + MongoDB API powering auth, plants, categories, events, climate zone lookup, image proxy (Unsplash), and email (nodemailer). Designed to keep keys private and provide simple, cache-friendly endpoints for the client.

## Stack

- Node 18+, Express 4
- MongoDB + Mongoose
- JWT auth (`express-jwt`)
- Nodemailer (Gmail App Password)
- (Planned) Open-Meteo for weather; `rrule` for recurrence; agenda/cron for reminders

## Quick Start

```bash
npm install
cp .env.example .env
npm start
```

### Requirements

- MongoDB (local or cloud)
- Node 18+ (LTS)
- Gmail App Password (or another SMTP provider)

## Environment

Create **.env** in the server root (example):

```env
# App
PORT=8000
NODE_ENV=development

# Client origin (CORS)
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=mongodb://127.0.0.1:27017/garden_almanac

# JWT
JWT_SECRET=super_secret_for_auth_tokens
JWT_ACCOUNT_ACTIVATION=activation_secret_for_signup

# Email (Gmail example - use an App Password)
EMAIL_FROM=noreply.gardenalmanac@gmail.com
EMAIL_TO=noreply.gardenalmanac@gmail.com
GMAIL_PASSWORD=your_gmail_app_password

# Unsplash (server-side only)
UNSPLASH_ACCESS_KEY=your_unsplash_key

# (Planned) Weather cache TTLs, etc.
```

> Tip: Add a comment **in your own copy** of `.env` to remind yourself to rotate keys; don’t commit secrets.

## Scripts

```bash
npm start      # runs server.js
```

## API (High Level)

Base URL: `/api`

**Auth**

- `POST /signin`
- `PUT /forgot-password` → sends email with reset token link
- `PUT /reset-password` → consumes token, sets new password
- `POST /signup` + `POST /account-activation` (via emailed token)

**User**

- `GET /user/:id` (protected)
- `PUT /user/update` (protected)

**Domain**

- `GET /categories` (protected)
- `GET /plants` (protected)
- `GET /events` (protected)
- `POST/PUT/DELETE` CRUD variants for each (protected)

**Utilities**

- `GET /climate-zone/:lat/:lon` (protected)
- `GET /unsplash/photos?query=…` (public or protected; proxied Unsplash)
- (Planned) `GET /weather?lat&lon` (Open-Meteo proxy + cache)

## Example: Unsplash Proxy

- Client calls: `/api/unsplash/photos?query=raspberries`
- Server adds header `Authorization: Client-ID <key>`, returns a small JSON:
  ```json
  {
    "url": "https://images.unsplash.com/....jpg",
    "alt": "raspberries",
    "query": "raspberries"
  }
  ```

## Example: Password Reset Flow

1. **Forgot password**

```bash
curl -i -X PUT "http://localhost:8000/api/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

2. Click the emailed link → client route `/reset-password/:token`
3. **Reset**

```bash
curl -i -X PUT "http://localhost:8000/api/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"<PASTE_TOKEN>", "newPassword":"Garden123"}'
```

## Security & CORS

- CORS allows `CLIENT_URL` in development; otherwise open (adjust as needed).
- Use Helmet and rate-limits for auth/proxy routes (on the list for Phase 1 hardening).

## Development Workflow

- **Protected branch:** `main` — deployable
- **Feature/Fix branches:** `feature/<name>`, `fix/<name>`
- **Conventional commits** preferred.

## Issues & Labels

Same labels as client (`bug`, `enhancement`, `good first issue`, …). Please link issues in PRs and describe testing steps.

## Roadmap (Server)

- [ ] **Axios → node-fetch** or keep axios (already working) + add small in-memory caches (Unsplash, Weather)
- [ ] `/api/weather?lat&lon` (Open-Meteo proxy) + 10-min cache
- [ ] RRULE storage on events + server expansion for date ranges
- [ ] Agenda/cron job for reminders (email channel first)
- [ ] Add Helmet, rate-limit, input validation on all routes
- [ ] Indexes on collections: `{ userId: 1 }`, `{ start: 1 }` for events

---

## Contributing (both repos)

1. Comment on an issue (or open one) and get assigned.
2. Branch from `main` → `feature/<issue-id>-short-name`
3. Keep PRs small and focused; include a brief demo (gif/screens).
4. Link related issues; request review.

## License
