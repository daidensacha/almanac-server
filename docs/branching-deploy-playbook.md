# Almanac Project

This repo is part of the **Almanac** application (Frontend / Backend).
It manages plants, categories, and recurring events in a seasonal calendar.

---

## 🚀 Development Workflow

See [Branching & Deploy Playbook](docs/branching-deploy-playbook.md) and [CONTRIBUTING](CONTRIBUTING.md).

We use a simple but reliable branching + deploy model.

### Branch Model

- **main** → always green; deploys to **production**
- **dev** → integration/staging; deploys to **staging**
- **feat/\*** → short-lived feature branches (from `dev`)
- **fix/\*** → small fixes (from `dev`)
- **exp/\*** → playground/spikes (may never merge)
- **hotfix/\*** → urgent production fixes (from `main`)

**Examples:**

```
feat/calendar-rbc
exp/calendar-fullcalendar
feat/events-normalization
fix/viewevent-null-plant
hotfix/unsplash-429
```

### Standard Workflow (feat/fix)

1. **Create branch from `dev`:**

   ```bash
   git checkout dev && git pull
   git checkout -b feat/<name>
   ```

2. **Work & push often:**

   ```bash
   git add .
   git commit -m "feat(<scope>): short, clear summary"
   git push -u origin feat/<name>
   ```

3. **Open PR → `dev`:**

   - CI (lint/test/build) must pass
   - 1 review approval
   - **Squash & merge** to keep history clean

4. **Staging QA:** auto-deployed from `dev`

5. **Release:** PR `dev → main` → auto-deploy to production

---

### Hotfix Workflow (prod broken)

```bash
git checkout main && git pull
git checkout -b hotfix/<name>
# fix, commit, PR -> main
# after merge:
git checkout dev && git pull
git merge main
git push
```

---

### Commit Convention

- **feat:** user-facing feature
- **fix:** bug fix
- **refactor:** internal code change (no behavior change)
- **chore:** tooling/deps/config
- **docs:** documentation
- **test:** tests only

**Examples**

```
feat(calendar): add RBC month/week/day + agenda view
fix(events): prefer query data over state in ViewEvent
refactor(date): migrate moment -> dayjs with helpers
```

---

### CI Checks

**Frontend**

```bash
pnpm lint
pnpm typecheck
pnpm test -- --watch=false
pnpm build
```

**Backend**

```bash
npm run lint
npm test
npm run build   # or tsc --noEmit
```

---

### Deploy Mapping

**Frontend (Vercel)**

- `main` → Production
- `dev` → Staging
- PRs → Preview URLs

**Backend (Render/Fly/Railway)**

- `main` → Prod service
- `dev` → Staging service

Use **separate env vars/DBs** for prod vs staging.

---

### Feature Flags (optional)

```js
const flags = { calendarRBC: true, fullcalendar: false };
{
  flags.calendarRBC && <CalendarView />;
}
```

---

### Tags & Releases

After merging `dev → main`:

```bash
git checkout main && git pull
git tag -a v0.x.0 -m "Release summary here"
git push --tags
```

---

### Quick Command Cheat-Sheet

**Start a feature**

```bash
git checkout dev && git pull
git checkout -b feat/<name>
```

**Commit & push**

```bash
git add .
git commit -m "feat(scope): summary"
git push -u origin feat/<name>
```

**Open PR → dev** (via GitHub)

**Release to prod**

```bash
# after testing on dev branch
# open PR dev -> main, merge
```

**Hotfix**

```bash
git checkout main && git pull
git checkout -b hotfix/<name>
# fix, PR -> main, merge, deploy
git checkout dev && git pull
git merge main && git push
```

---

## 📄 License

MIT
