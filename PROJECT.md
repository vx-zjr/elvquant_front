# elvquant_front Project

## Goal

Build a bilingual, mature research cockpit for `elvquant_core`. The front end is
a UI/BFF adapter: it authenticates users, validates API contracts, proxies calls
to the core service, and renders structured reports. It must not implement
trading, risk, accounting, data-provider, broker, or secret-handling business
logic.

## Current Direction

The current Streamlit replacement is being rebuilt as a Next.js App Router app
because Vercel deployment, server-side API proxying, Clerk integration, and
service-token isolation need a backend-for-frontend boundary. If a future review
proves Next.js cannot satisfy those needs, the replacement decision must be
recorded here before code changes.

The active UI direction is an operational quant cockpit: dense, scan-friendly,
bilingual, and animated only where motion communicates system state. Visuals
must be derived from structured report/API data rather than invented trading
signals.

## Required Start Protocol

Before editing, read:

- `../PROJECT_MEMORY.md`
- `PROJECT.md`
- `TASKS.md`
- `REVIEW.md`
- `RUNBOOK.md`
- `README.md`

Then execute only the first `Pending` task in `TASKS.md` unless the user
explicitly changes scope.

## Boundary Rules

- Browser code never sees `CORE_API_SERVICE_TOKEN`.
- Production owner identity comes from Clerk session state, not arbitrary
  forwarded browser headers.
- Local debug may use `AUTH_MODE=local` and `LOCAL_DEBUG_USER_ID`.
- Every API response crossing into UI code must be parsed by a runtime schema.
- UI may format and visualize metrics, but core owns metric definitions.
