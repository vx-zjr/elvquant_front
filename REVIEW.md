# Review Checklist

Before completing a front-end task, verify:

- Relevant documents were read and updated.
- No trading, risk, accounting, data-provider, broker, or secret business logic
  was added to TypeScript UI code.
- Browser-exposed variables contain only public values.
- Core API request and response payloads are schema-validated.
- Authenticated owner identity is server-derived.
- Loading, error, empty, and failed states render without a blank page.
- Chinese and English text comes from the i18n dictionary.
- `npm run lint`, `npm run test`, and `npm run build` were run.
- Browser smoke testing covered the primary dashboard and run detail flow.
