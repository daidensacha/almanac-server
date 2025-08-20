# Garden Almanac

![Mockup](./images/mockup1.jpg)

**Garden Almanac** is a full-stack project consisting of a React frontend (**almanac-client**) and a Node/Express backend (**almanac-server**) powered by MongoDB. It helps track plants, categories, events, and seasonal tips — with extras like Unsplash image integration and email-based authentication.

---

## Project Structure

- **almanac-client** → React frontend
- **almanac-server** → Express + MongoDB backend
- **almanac-shared** → Shared constants and helpers (password rules, validation, etc.)

---

## Features

- 🌱 JWT-based authentication (signup with email activation, login, forgot/reset password)
- 🌦 Climate zone lookup (future: weather forecast proxy)
- 🗓 Event and plant management with categories
- 📷 Unsplash proxy endpoint (safe keys, cache-friendly)
- 📧 Email delivery with Nodemailer (App Password or SMTP)
- 🔒 Validators, CORS, and logger utility for cleaner DX

---

## Stack

- **Frontend:** React (Vite), Axios, TailwindCSS
- **Backend:** Node.js 18+, Express, MongoDB (Mongoose), JWT, Nodemailer
- **Shared:** npm package `@daidensacha/almanac-shared`

---

## Quick Start

### Server

```bash
cd almanac-server
npm install
cp .env.example .env
npm start
```

Requirements:

- Node.js 18+
- MongoDB (local or Atlas cluster)
- Gmail App Password (or SMTP credentials)

### Client

```bash
cd almanac-client
npm install
npm start
```

---

## Environment Variables (Server)

```env
# App
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=mongodb://127.0.0.1:27017/garden_almanac

# JWT
JWT_SECRET=super_secret_for_auth_tokens
JWT_ACCOUNT_ACTIVATION=activation_secret_for_signup

# Email
EMAIL_FROM=noreply.gardenalmanac@gmail.com
EMAIL_TO=noreply.gardenalmanac@gmail.com
GMAIL_PASSWORD=your_gmail_app_password

# Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

---

## API Overview

Base URL: `/api`

### Auth

- `POST /signup` + `POST /account-activation`
- `POST /signin`
- `PUT /forgot-password`
- `PUT /reset-password`

### User

- `GET /user/:id`
- `PUT /user/update`

### Domain

- `GET /categories`
- `GET /plants`
- `GET /events`
- CRUD variants for each

### Utilities

- `GET /climate-zone/:lat/:lon`
- `GET /unsplash/photos?query=…`

---

## Example: Password Reset Flow

```bash
# Request reset
domain/api/forgot-password { email }

# User clicks emailed link → frontend route `/reset-password/:token`

# Confirm reset
domain/api/reset-password { token, newPassword }
```

---

## Shared Package

`almanac-shared` provides reusable constants and validation rules.

Exports:

- `PASSWORD_REGEX`
- `PASSWORD_MESSAGE`

Usage:

```js
// Client (ESM)
import { PASSWORD_REGEX, PASSWORD_MESSAGE } from '@daidensacha/almanac-shared';

// Server (CommonJS)
const { PASSWORD_REGEX } = require('@daidensacha/almanac-shared');
```

---

## Development Workflow

- Protected branch: **main**
- Branches: `feature/<name>` or `fix/<name>`
- Use **conventional commits**
- PRs should link issues and show testing steps

---

## Roadmap

- [ ] Weather API proxy (Open-Meteo) + caching
- [ ] Recurrence rules (RRULE) for events
- [ ] Agenda/cron reminders (email → push)
- [ ] Security hardening (Helmet, rate-limit, deeper validation)
- [ ] Advanced dashboard features (charts, plant insights)

---

## Contributing

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md)

- Comment or open an issue before starting
- Use feature branches from `main`
- Keep PRs focused & small
- Add screenshots/gifs when relevant

Quick Links:

- [Open a Bug Report](../../issues/new?template=bug_report.md)
- [Request a Feature](../../issues/new?template=feature_request.md)

---

## License

MIT © Daiden Sacha
