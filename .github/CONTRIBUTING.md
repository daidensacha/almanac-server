# Contributing to Garden Almanac

🎉 Thanks for your interest in contributing! This project is an ongoing
work, and contributions are welcome.

---

## Getting Started

1.  **Fork** the repo and create your branch from `main`:

    ```bash
    git checkout -b feature/my-new-feature
    ```

2.  **Install dependencies**:

    - Client (React):

      ```bash
      cd almanac-client
      npm install
      ```

    - Server (Node/Express):

      ```bash
      cd almanac-server
      npm install
      ```

3.  **Start development servers**:

    - Client:

      ```bash
      npm start
      ```

    - Server:

      ```bash
      npm start
      ```

---

## Branching Model

We follow a **clean main branch** workflow:

- **`main`** → Always stable and deployable.
- **`dev`** → Active development branch where new features and fixes are integrated.
- **`feature/*`** → One branch per new feature or improvement. Example: `feature/calendar-view`.
- **`bugfix/*`** → For targeted bug fixes. Example: `bugfix/login-redirect`.
- **`hotfix/*`** → Urgent fixes applied directly to `main` (and merged back into `dev`).

### Workflow

1. Create a new branch from `dev` for your work:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   ```
2. Commit your changes with clear, conventional commit messages.
3. Push your branch and open a Pull Request into `dev`.
4. Once reviewed and tested, `dev` is merged into `main` during a release.

### Commit Messages

We recommend following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- **feat:** a new feature (e.g. `feat: add month view to calendar`)
- **fix:** a bug fix (e.g. `fix: correct date format in event card`)
- **docs:** documentation only changes
- **style:** formatting, missing semi colons, etc.
- **refactor:** code changes that neither fix a bug nor add a feature
- **test:** adding missing tests
- **chore:** build process or auxiliary tool changes

---

## Pull Requests

1.  Open a PR against `dev` (not `main`).
2.  Link to related issue(s) in the PR description.
3.  Ensure your code is formatted and linted.
4.  PRs require at least one review before merging.

---

## Issues

- Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template
  for bugs.
- Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
  template for new ideas.
- Be descriptive --- include screenshots or logs when helpful.

---

## Code Style

- Client: React + Material UI, keep components clean and reusable.
- Server: Node.js + Express + MongoDB (or SQLite for dev).
- Prefer ES6+ syntax, async/await, and descriptive variable names.

---

# Logging Guidelines

We use [Winston](https://github.com/winstonjs/winston) for structured logging.
This helps keep logs consistent, color-coded in development, and filterable by
log level.

## Levels

- **logger.error** → For unexpected errors, exceptions, and failed operations.
- **logger.warn** → For recoverable issues or potential problems.
- **logger.info** → For high-level lifecycle messages (e.g., "Server started").
- **logger.debug** → For detailed request tracing and debugging (enable with `LOG_LEVEL=debug`).

## Best Practices

1. **Use structured objects**

   ```js
   logger.debug('Finding user by email', { email });
   ```

   Avoid dumping huge objects (like entire request bodies).

2. **Trace the request lifecycle**

   - Entry point: log function start and key params.
   - Before external calls (DB/API).
   - After receiving results.
   - Exit point: before sending response.

3. **Don’t over-log in production**
   Debug logs should only be enabled temporarily with `LOG_LEVEL=debug`.

4. **Use error logs wisely**
   Always `logger.error(err)` inside catch blocks, but return user-friendly
   messages to the frontend.

5. **Consistency matters**
   Prefer one clear log per step rather than multiple fragmented logs.

---

## Questions?

Open a
[Discussion](https://github.com/daidensacha/almanac-server/discussions)
or create an issue!
