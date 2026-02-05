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

## Quick Start — Server

Choose **one** configuration model:

- **Option A — dotenv**: local `.env` file (explicit, simple)
- **Option B — Phase**: inject environment variables at runtime (no `.env` file)

### Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- Client running at `http://localhost:5173`

---

## Option A — dotenv (.env)

```bash
cd almanac-server
npm install
cp .env.example .env
# Important, edit and replace .env placeholders then continue with next step
npm run dev
```

### Environment Variables

```bash
# .env - *** replace placeholders prior to running "npm run dev" ***
NODE_ENV=development
PORT=8000
LOG_LEVEL=debug

CLIENT_ORIGIN=http://localhost:5173

DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>/<db>

JWT_SECRET=your_super_secret_key
JWT_ACCOUNT_ACTIVATION=activation_secret
JWT_RESET_PASSWORD=reset_secret

EMAIL_FROM=noreply.gardenalmanac@gmail.com
EMAIL_TO=noreply.gardenalmanac@gmail.com
GMAIL_PASSWORD=your_app_password

GOOGLE_CLIENT_ID=your_google_client_id

UNSPLASH_ACCESS_KEY=your_unsplash_key
```

> ⚠️ Never commit `.env` files. `.env.example` is documentation only.

---

## Option B — Phase (recommended)

Phase injects environment variables at runtime (**no local `.env` required**).

This README assumes Phase is already installed and configured.  
For setup and usage details, see: https://docs.phase.dev

Run the server:

```bash
phase run "npm run dev"
```

Production-like start:

```bash
phase run "npm start"
```

> Environment variable names are identical to `.env.example`.

---

## Scripts

```bash
npm run dev     # development (nodemon, debug logging)
npm start       # production-like start
```

---

## API Overview

Base path: `/api`

### Auth

- `POST /signup`
- `POST /account-activation`
- `POST /signin`
- `PUT /forgot-password`
- `PUT /reset-password`

### Domain

- `GET /plants`
- `GET /categories`
- `GET /events`
- CRUD variants for each

### Utilities

- `GET /climate-zone/:lat/:lon`
- `GET /unsplash/photos?query=…`

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

## Upgrade Path (Recommended)

### Node.js
- Current: Node 18 LTS
- Next: Node 20 LTS
- Verify Express & Mongoose compatibility

### Dependencies
- Run `npm outdated`
- Upgrade incrementally (mongoose, nodemailer, jsonwebtoken)

### Express
- Express 4 → 5 (when stable)
- Audit middleware compatibility

---

## Development Notes

- Unsplash keys must remain server-side
- JWTs are used for auth
- Email flows rely on Gmail App Password or SMTP

---

## License

MIT © Daiden Sacha