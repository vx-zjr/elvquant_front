# elvquant_front

Next.js App Router dashboard for `elvquant_core`.

The front end is a replaceable UI adapter. It authenticates users in production,
calls the independent core API, and renders structured reports. Strategy logic,
risk checks, data normalization, accounting, order generation, and secrets remain
outside the UI.

The project memory rule lives in `../PROJECT_MEMORY.md`: durable documents are
the source of truth for development context, not chat history alone.

## Local Setup

Run the core API first:

```powershell
cd ..\elvquant_core
.\.venv\Scripts\python -m uvicorn qts.api_app:app --reload --port 8000
```

Install and run the front end with a Node.js package manager:

```powershell
cd ..\elvquant_front
npm install
npm run dev
```

Open `http://localhost:3000`.

Language can be switched with URL parameters:

- Chinese: `http://localhost:3000/?lang=zh`
- English: `http://localhost:3000/?lang=en`

The UI is designed as a research cockpit: workflow cards, localized KPI labels,
run history, structured report details, and equity-curve visualization.

## Environment

Copy `.env.example` to `.env.local` and set real values outside git:

```env
CORE_API_BASE_URL=http://127.0.0.1:8000
CORE_API_SERVICE_TOKEN=dev-token
LOCAL_DEBUG_USER_ID=local-debug-user
AUTH_MODE=local
NEXT_PUBLIC_DEFAULT_LOCALE=zh
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
```

`CORE_API_SERVICE_TOKEN` must match `ELVQUANT_API_SERVICE_TOKEN` in the core API
environment. It is server-only and must not be exposed as `NEXT_PUBLIC_*`. Local
development uses `AUTH_MODE=local` plus `LOCAL_DEBUG_USER_ID` as the run owner so
the dashboard can be debugged before Clerk is provisioned. Production should use
`AUTH_MODE=clerk` and derive the owner id from the authenticated Clerk session.

The rebuilt UI includes run filtering, workflow cards, loading/error states,
artifact browsing, Stooq status, and bilingual Chinese/English rendering.

## Vercel Target

- Next.js runs on Vercel.
- Clerk provides authentication.
- Neon stores user/run/artifact metadata.
- Vercel Blob stores JSON and Markdown report artifacts.
- The quantitative core runs in an independent API service, not in Vercel Functions.

## Quality Gates

```powershell
npm run lint
npm run test
npm run build
```

## Boundary Rules

- Do not import Python core modules into the front end.
- Do not implement trading, risk, accounting, data-provider, broker, or secret-handling logic in TypeScript UI code.
- Route handlers may authenticate, proxy requests, validate response schemas, and persist UI metadata only.
