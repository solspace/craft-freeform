# A/B Testing

This bundle lets you split traffic between multiple Freeform forms (variants), track their performance, and identify a winner.

## What It Does

- Assigns visitors to a variant based on configured variant weights.
- Persists assignment (cookie and/or logged-in user assignment).
- Tracks lifecycle events for each test session:
  - `served` (impression)
  - `interacted`
  - `failed`
  - `completed` (conversion)
- Provides CP dashboard data for charts and variant performance cards.
- For ended tests, serves the winning variant (best conversion rate).

---

## Backend / Twig Usage

Use the Freeform variable:

```twig
{% set form = craft.freeform.abTest('myAbTestHandle') %}
{{ form ? form.render() : '' }}
```

Important:

- The argument is the **A/B test handle**.
- The variant provider resolves a variant for that handle.
- A/B metadata is injected into form render properties (`variant`, `sessionId`) and used for tracking.

Entry points:

- `Solspace\Freeform\Variables\FreeformVariable::abTest()`
- `Solspace\Freeform\Bundles\ABTesting\Providers\ABTestVariantProvider`
- `Solspace\Freeform\Bundles\ABTesting\ABTestingBundle`

---

## Frontend / Control Panel Usage

In Freeform CP:

1. Open **A/B Tests**.
2. Click **Add Test**.
3. Configure:
   - Name
   - Handle (auto-generated from name, editable)
   - Description
   - Start date
   - Optional end date
   - Variants (form + weight)
4. Save.

Per test card in dashboard:

- Shows status (`Active` / `Ended`), running days, variant count, total impressions.
- `Edit` opens prefilled modal.
- `Delete` removes test after confirmation.
- Chart tabs:
  - Conversion Rate
  - Impressions
  - Interactions
  - Failures
- Variant cards show:
  - Weight
  - Impressions
  - Interactions
  - Failures
  - Conversions
  - Conversion rate
  - Winner badge

Main client files:

- `packages/client/src/app/pages/ab-tests/index.tsx`
- `packages/client/src/app/pages/ab-tests/ab-tests.modal.tsx`
- `packages/client/src/app/pages/ab-tests/ab-tests.chart.tsx`
- `packages/client/src/app/pages/ab-tests/ab-tests.card.tsx`
- `packages/client/src/app/pages/ab-tests/ab-tests.queries.ts`

---

## Metrics Definitions

- **Impressions (`served`)**:
  - Total sessions served to a variant.
  - Includes all final statuses (`served`, `interacted`, `failed`, `completed`).
- **Interactions (`interacted`)**:
  - Sessions that reached interacted/failed/completed states.
- **Failures (`failed`)**:
  - Sessions ending in failed state.
- **Conversions (`completed`)**:
  - Sessions ending in completed state.
- **Conversion Rate**:
  - `completed / served`.

---

## Data / API Overview

CP APIs used by the frontend:

- `GET /freeform/api/ab-tests/dashboard`
- `GET /freeform/api/ab-tests/statistics`
- `POST /freeform/api/ab-tests`
- `POST /freeform/api/ab-tests/{id}`
- `POST /freeform/api/ab-tests/{id}/delete`

Tracking endpoint:

- `POST /freeform/ab-test/tracker`
  - Endpoint class: `Endpoints/StatisticsTracker.php`

Persistence tables:

- `freeform_ab_tests`
- `freeform_ab_tests_variants`
- `freeform_ab_tests_statistics`
- `freeform_ab_tests_assignments`

---

## Winner Selection

Winner logic is shared via:

- `Providers/ABTestWinnerResolver.php`

Rules:

1. Highest conversion rate (`completed / served`)
2. If tied: higher `completed`
3. If still tied: lower variant id

For ended tests, winner selection is cached for short-term reuse in runtime lookup.
