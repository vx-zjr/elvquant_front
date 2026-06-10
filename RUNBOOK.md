# Runbook

## Local Debug

Start the Python core API:

```powershell
cd H:\git\elvquant_core
$env:ELVQUANT_API_SERVICE_TOKEN="dev-token"
.\.venv\Scripts\python -m uvicorn qts.api_app:app --host 127.0.0.1 --port 8000
```

Start the front end:

```powershell
cd H:\git\elvquant_front
$env:CORE_API_BASE_URL="http://127.0.0.1:8000"
$env:CORE_API_SERVICE_TOKEN="dev-token"
$env:AUTH_MODE="local"
$env:LOCAL_DEBUG_USER_ID="local-debug-user"
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

## Quality Gates

```powershell
npm run lint
npm run test
npm run build
```

If Windows blocks npm shims with `Access is denied` inside Codex Desktop, run
the same tools through the bundled Node executable:

```powershell
& 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\eslint\bin\eslint.js .
& 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\vitest\vitest.mjs run
& 'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\next\dist\bin\next build
```

## Environment Variables

- `CORE_API_BASE_URL`: server-only core API URL.
- `CORE_API_SERVICE_TOKEN`: server-only token forwarded to the core API.
- `AUTH_MODE`: `local` for local debug, `clerk` for production.
- `LOCAL_DEBUG_USER_ID`: owner id used only in local mode.
- `NEXT_PUBLIC_DEFAULT_LOCALE`: optional public initial locale, `zh` or `en`.

Do not add a source-code fallback for `CORE_API_SERVICE_TOKEN`.
