# Freeform Headless — npm packages

Official Freeform frontend packages for **React / Next.js**. These npm packages use an **independent semver line** from the Freeform Craft plugin.

| Layer | Versioning |
| --- | --- |
| Freeform Craft plugin | Normal releases (e.g. `5.15.x` / `5.16.x`) — includes the headless REST API |
| `@solspace/freeform-*` npm packages | Independent (`0.1.0`, `0.2.0`, …) on the npm `latest` tag |

## What’s included

| Package | Role |
| --- | --- |
| `@solspace/freeform-core` | Manifest client, state, conditionals, submit |
| `@solspace/freeform-react` | `<Freeform />` + `useFreeform()` |
| `@solspace/freeform-extensions` | Captchas, datetime, file DnD |
| `@solspace/freeform-react-theme-default` | Default light/dark theme CSS |

Requires a Freeform plugin build that includes the headless REST API, with headless enabled in config.

## Install

```bash
npm install @solspace/freeform-core \
  @solspace/freeform-react \
  @solspace/freeform-extensions \
  @solspace/freeform-react-theme-default
```

```tsx
import { Freeform } from "@solspace/freeform-react";
import { recommendedExtensions } from "@solspace/freeform-extensions";
import "@solspace/freeform-react-theme-default/styles.css";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl={process.env.NEXT_PUBLIC_CRAFT_URL}
      extensions={recommendedExtensions}
    />
  );
}
```

Prefer a **same-origin proxy** for `/freeform/*` so CSRF cookies work without cross-origin friction.

## Version bumps

Do **not** hand-edit version strings in source. From the Freeform repo root:

```bash
pnpm frontend:bump patch   # or minor / major / 0.2.0
```

That updates all four `package.json` files, peer ranges, and the `src/version.ts` files used at runtime.

Then build + publish (see frontend-library `PACKAGE-RELEASE.md`).

## Known limitations

- Drafts / save & continue — not yet
- Payments (Stripe, etc.) — not yet
- Calculation fields — unsupported renderer
- Vue adapter — not yet
- Bootstrap & Tailwind theme packages — not yet
- Full GraphQL parity with the REST contract — not yet
- Conditional show/hide is **client UX only** (not a security boundary)

## Security checklist

1. Keep headless **off** until intentionally enabled per form.
2. Set explicit `headless.allowedOrigins` for cross-origin apps.
3. Require **captcha** on public forms.
4. Leave **`allowRawHtml` false** unless HTML fields are trusted CMS content.
5. Do not treat client-side conditional hiding as access control.

## Feedback

Report issues with your **Freeform plugin version** and the installed `@solspace/freeform-*` package versions.
