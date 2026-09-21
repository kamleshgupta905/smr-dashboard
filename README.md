# VMH GROUP'S • SMR — Survey Marketplace & Routing Platform

High-speed **MERN** (MongoDB, Express, React, Node.js) platform that aggregates
survey demand from **Zamplia Supply API** and **Market Xcel Demand API**, exposes
it through an enterprise dashboard, and routes/verifies respondent traffic with
HMAC/SHA-3 signed callback links.

> Replaces the legacy PHP/Laravel stack (kept in this repo for reference only).
> The production code path is `server/` (API) + `client/` (dashboard).

---

## Quick Start

```bash
# 1. Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# 2. Configure environment (a working .env is included in server/.env)
#    — at minimum set your real Zamplia key:
#    ZAMPLIA_API_KEY=your_key          (or ZAMPLIA_SANDBOX_API_KEY + ZAMPLIA_USE_SANDBOX=true)

# 3. Start backend (port 5000) and frontend (port 3000, proxies /api → 5000)
cd server && node src/server.js        # terminal 1
cd client && npm run dev               # terminal 2
```

Open **http://localhost:3000** and sign in:

| Username    | Password  | Source            |
| ----------- | --------- | ----------------- |
| `vmhgroup`  | `Jelly`   | Built-in Super Admin |
| `admin`     | `admin123`| Built-in fallback  |
| *(any admin in your Google Sheet / MongoDB)* | | External (see below) |

> ⚠️ **Production note:** the built-in admin credentials are a demo fallback.
> For production, point the platform at your Google Sheet user database
> (`GOOGLE_SHEET_AUTH_URL` / `credentials.json`) or MongoDB, and rotate/remove
> the built-in accounts.

---

## System Status — "Is my API key working?"

The platform reports upstream health honestly — **it never silently pretends
simulated data is live**:

- **Top bar pill:** `LIVE DATA` (green, pulsing) vs `DEMO DATA` (amber).
- **Click the pill** → panel with per-upstream reachability, HTTP status,
  latency, key source (`env` vs `builtin_demo_key`), MongoDB state, and a
  **Check now** button.
- **API:** `GET /api/status` (add `?force=true` to re-probe now).
- **Demo banner** appears automatically when live APIs are unreachable.

```bash
curl http://localhost:5000/api/status
```

If `upstreams.zamplia.live` is `true`, your key is valid **and** accepted by
Zamplia (a bad key would return HTTP 401/403). If it is `false`, read the
`error` field — it distinguishes *network unreachable* from *key rejected*.

To verify from your own machine outside the sandbox:

```bash
curl -H "ZAMP-KEY: $ZAMPLIA_API_KEY" \
  "https://surveysupply.zamplia.com/api/v1/Surveys/GetAllocatedSurveys?country=all&language=en-US"
```

---

## API Credentials

| Service      | Env vars (in `server/.env`) | Purpose |
| ------------ | --------------------------- | ------- |
| Zamplia Supply  | `ZAMPLIA_API_KEY`, `ZAMPLIA_BASE_URL`, `ZAMPLIA_USE_SANDBOX`, `ZAMPLIA_SANDBOX_API_KEY`, `ZAMPLIA_HMAC_SECRET` | Fetch allocated surveys, quotas, quals, generate entry links, reconciliation |
| Market Xcel Demand | `MARKETXCEL_BASE_URL`, `MARKETXCEL_CRM_URL`, `MARKETXCEL_SUPPLIER_ID`, `MARKETXCEL_TOKEN`, `MARKETXCEL_SECRET_KEY` | Demand projects, master data, S2S callbacks, SHA-3 hashing |
| Google Sheets user DB | `GOOGLE_SPREADSHEET_ID`, `GOOGLE_SHEET_AUTH_URL` or `credentials.json`/`token.json` | Admin user authentication |
| App | `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET` | Runtime |

> 🔐 The built-in fallback keys in `server/src/config/*.js` exist only so the
> demo runs without configuration. For production, set every key in `.env`
> (git-ignored) and treat any committed fallback as **compromised → rotate it**.

---

## Architecture

```
client/  React 18 + Vite + Axios + Lucide (dashboard, port 3000, proxies /api)
server/  Node.js + Express (port 5000)
  ├─ config/        zamplia.js, marketXcel.js, db.js (graceful no-Mongo mode)
  ├─ controllers/   survey, router, project, auth, client, security, analytics, apiExplorer
  ├─ services/      zampliaService (16 Supply APIs + probe), marketXcelService,
  │                 hmacService, hashingService (SHA-3), s2sService, fraudService,
  │                 googleSheetsDirectService, demoInventory (deterministic demo catalog)
  ├─ models/        Mongoose: ApiSurvey, Project, Vendor, Lead, User, SecurityPolicy…
  └─ routes/        /api/zamplia, /api/manage, /api/clients, /api/security,
                    /api/explorer, /api/auth, /api/dashboard, /api/status,
                    /redirects/c/:client/{complete,terminate,quotafull,quality_terminate}
```

**Resilience model:** if MongoDB is down the server runs in in-memory mode
(flagged in `/api/status`); if a live upstream is unreachable the service
returns `source: 'simulated_fallback'` and the UI shows the amber
`DEMO DATA` badge + banner. Nothing is ever masqueraded as live.

---

## Key Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET    | `/health` | Liveness |
| GET    | `/api/status` | Upstream/Mongo/key health (add `?force=true` to re-probe) |
| GET    | `/api/zamplia` | Combined Zamplia + Market Xcel inventory (with `simulated` flag) |
| GET    | `/api/zamplia/sync` | Force re-sync inventory |
| GET    | `/api/zamplia/top-picks` | Highest-CPI studies |
| GET    | `/api/zamplia/qualifications/:id` · `/quotas/:id` · `/global-stats/:id` | Study inspection |
| GET    | `/api/zamplia/reconciliation` · `/reference-data` | Audit ledger & catalogs |
| POST   | `/api/zamplia/generate-link` | Signed entry-link generation |
| POST   | `/api/auth/login` · GET `/api/auth/me` | Admin authentication (JWT) |
| GET/POST | `/api/manage/{projects,vendors,users}` | RBAC management |
| GET/PUT | `/api/security/policy` · POST `/api/security/simulate-check` | Fraud policy & screening |
| GET    | `/api/dashboard/analytics` | KPI aggregates |
| GET    | `/api/clients` · POST `/api/clients/test-s2s` · `/test-hashing` | S2S integration |
| GET    | `/redirects/c/:client/{complete,terminate,…}?rid=…&hash=…` | Signed traffic-router callbacks |

---

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run client` | Start Vite dev server (client/) |
| `npm run server` / `npm start` | Start Express API (server/) |
| `npm run build` | Production build (client/dist → dist/) |
| `npm run dev` | Local preview |
| `node scripts/ui-smoke-test.js` | **E2E UI test** — boots the production bundle in jsdom against the live backend and asserts login → dashboard → status pill → real-data widgets |

---

## Deployment Notes

- **Vercel (frontend):** `vercel.json` builds `dist/` and rewrites all routes to the SPA.
- **API host:** any Node host (Render/Railway/VM). Set `NODE_ENV=production` and all
  credentials as env vars; put it behind TLS. `trust proxy` is enabled for IP
  logging behind Nginx/Cloudflare.
- **Cron:** an in-process `node-cron` re-syncs Zamplia inventory every 15 min.
- **MongoDB:** optional at runtime (in-memory fallback) but strongly recommended
  for persistence of vendors/leads/projects and the reconciliation ledger.
