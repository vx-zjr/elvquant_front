# Tasks

## Task ID: FRONT-001

Status: Pending
Phase: Audit hardening and rebuild
Title: Rebuild Next.js research cockpit boundary and experience

Scope:
- Replace ad hoc auth/env handling with server-only environment validation.
- Add route middleware and route-handler body/response validation.
- Remove dead storage code until Neon is actually wired.
- Replace reload-based workflow submission with client refresh/polling states.
- Add loading, error, empty, and failed-run states.
- Rebuild dashboard/detail pages as a bilingual research cockpit with richer
  charts, workflow browsing, run filtering, artifact viewing, and Stooq status.
- Keep trading, risk, accounting, broker, and data-source logic out of the UI.

Acceptance criteria:
- `npm run lint`, `npm run test`, and `npm run build` pass.
- In-app browser can open `http://127.0.0.1:3000`, switch Chinese/English, start
  a run, open details, and inspect charts/artifacts.
- No committed secret defaults exist for service tokens.
- Documentation matches local debug commands and environment variables.

## Task ID: FRONT-002

Status: Pending
Phase: Interaction polish
Title: Add mature quant-system motion and dynamic visualization

Scope:
- Add a live-feeling market telemetry strip, execution lane, and system pulse
  animations without adding fake trading logic.
- Add interactive run-detail visualizations for equity, drawdown, allocation,
  cash/cost timeline, and risk posture using only structured report data.
- Add richer dashboard controls and visual feedback for workflow selection,
  run launch, filters, and status changes.
- Keep animation restrained and operational: motion should help scan state,
  not become marketing decoration.

Acceptance criteria:
- Analysis helpers for drawdown, allocation, timeline, and workflow health have
  tests.
- Dashboard and run detail pages expose the new panels in both Chinese and
  English.
- Browser smoke verifies the dashboard and run detail render the dynamic panels.
- `lint`, `test`, and `build` pass through the documented Node fallback commands
  when npm shims are blocked.
