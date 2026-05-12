# m2-tenant-app

M2 — inquilino (mobile-first). Vite + React 19 + React Router v7 + TypeScript. Talks to [`m2-api`](https://github.com/nalancer08/m2-api).

> Sibling app: [`m2-web-app`](https://github.com/nalancer08/m2-web-app) — the broker dashboard. Both apps share the same backend.

## What this app is

The flow an inquilino sees when a broker shares them a screening link. Mobile-first (centered at 480 px max width), simple step-by-step UX, magic-link entry point via `/i/:linkToken`.

## Stack

- **Vite + React 19 + React Router v7 + TypeScript**
- Plain **CSS + CSS Modules** with M2 design tokens
- **@tanstack/react-query** + **axios**
- **react-hook-form + zod**

## Run locally

```bash
cp .env.example .env
npm install
npm run dev       # http://localhost:5174 (broker app uses 5173)
```

`m2-api` must be running at `VITE_API_URL` (defaults to `http://localhost:3001`).

## Routes

| Path                   | Auth   | Notes |
|------------------------|--------|-------|
| `/i/:linkToken`        | —      | Public landing for the magic link. Tomorrow this will hydrate property + product + broker info from `GET /public/deals/:linkToken` and route to signup/login with `link_token` preserved. |
| `/auth/signup`         | —      | Tenant signup. Honors `?link_token=...` to attach to a deal on creation (FASE 6 wires the API side). |
| `/auth/login`          | —      | Tenant login. |
| `/`                    | tenant | Welcome screen (placeholder for the deal list / next-step CTA). |

JWT lives in `localStorage` under `m2.tenant.access_token`. The axios client attaches it as Bearer, clears it on 401, and redirects to `/auth/login`. The `RequireTenantAuth` route gate also enforces that the JWT's `profile_type === 'tenant'` — so a broker that logs in here gets bounced.

## Project structure

```
src/
├── api/                  # axios client + per-domain API modules
├── auth/                 # AuthProvider, RequireTenantAuth
├── components/
│   ├── icons/            # SVG icons
│   ├── primitives/       # Logo, Button, Field, Card, ProgressBar
│   └── layout/           # TenantShell (header + sticky progress)
├── lib/                  # cn util
├── pages/
│   ├── auth/             # LoginPage, SignupPage
│   ├── welcome/          # logged-in landing
│   └── flow/             # LinkLandingPage (magic-link entry)
├── router/               # createBrowserRouter config
├── styles/               # tokens.css + globals.css
└── main.tsx              # entry
```

## Roadmap

- **FASE 5** ✅ — Bootstrap, design tokens, primitives, auth pages, magic-link landing skeleton, welcome screen.
- **FASE 6** — Full tenant flow: welcome → personal → references → empleo → liveness/INE → pago → confirmation. Backed by `POST /public/deals/:linkToken/start` + `deal-tenant` attach + uploads + Stripe stub.
