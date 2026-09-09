# Freeform Headless — npm packages

> **Maintainers / repo only.** This file is **not** published to npm. Customer-facing install docs live at:
> [Headless Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/).

Official Freeform frontend packages for **React / Next.js** and **Vue / Nuxt**. These npm packages use an **independent semver line** from the Freeform Craft plugin.

| Layer | Versioning |
| --- | --- |
| Freeform Craft plugin | Normal releases (e.g. `5.15.x` / `5.16.x`) — includes the headless REST API |
| `@solspace/freeform-*` npm packages | Independent (`0.1.0`, `0.2.0`, …) on the npm `latest` tag |

## What’s included

| Package | Role |
| --- | --- |
| `@solspace/freeform-core` | Manifest client, state, conditionals, submit |
| `@solspace/freeform-react` | `<Freeform />` + `useFreeform()` (React) |
| `@solspace/freeform-vue` | `<Freeform />` + `useFreeform()` (Vue 3) |
| `@solspace/freeform-extensions` | Captchas, calculation, datetime, file DnD |
| `@solspace/freeform-theme-default` | Default light/dark BEM CSS |
| `@solspace/freeform-theme-tailwind` | Official Tailwind starter theme for React & Vue forms |
| `@solspace/freeform-theme-bootstrap` | Official Bootstrap 5 starter theme for React & Vue forms |

Requires a Freeform plugin build that includes the headless REST API, with headless enabled in config.

## Install

**React / Next.js**

```bash
npm install @solspace/freeform-core \
  @solspace/freeform-react \
  @solspace/freeform-extensions \
  @solspace/freeform-theme-default
```

**Vue 3**

```bash
npm install @solspace/freeform-core \
  @solspace/freeform-vue \
  @solspace/freeform-extensions \
  @solspace/freeform-theme-default
```

```tsx
import { Freeform } from "@solspace/freeform-react";
import { recommendedExtensions } from "@solspace/freeform-extensions";
import "@solspace/freeform-theme-default/styles.css";

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

That updates all package.json files, peer ranges, and the `src/version.ts` files used at runtime.

## Build & publish

`dist/` is **not** committed (see `.gitignore`). Always build before publishing so npm gets fresh artifacts.

From the Freeform repo root:

```bash
# 1. Bump (if needed)
pnpm frontend:bump patch

# 2. Build every frontend package (order matters for local linking)
pnpm --filter @solspace/freeform-core build
pnpm --filter @solspace/freeform-react build
pnpm --filter @solspace/freeform-vue build
pnpm --filter @solspace/freeform-extensions build
pnpm --filter @solspace/freeform-theme-default build
pnpm --filter @solspace/freeform-theme-tailwind build
pnpm --filter @solspace/freeform-theme-bootstrap build

# 3. Publish (same order — core first, then consumers)
pnpm --filter @solspace/freeform-core publish --access public
pnpm --filter @solspace/freeform-react publish --access public
pnpm --filter @solspace/freeform-vue publish --access public
pnpm --filter @solspace/freeform-extensions publish --access public
pnpm --filter @solspace/freeform-theme-default publish --access public
pnpm --filter @solspace/freeform-theme-tailwind publish --access public
pnpm --filter @solspace/freeform-theme-bootstrap publish --access public
```

Local demos (`FREEFORM_PACKAGES=local`) should alias to package **`src`**, not `dist`, so day-to-day work does not depend on committed build output.

## Known limitations

- Full GraphQL parity with the REST contract — not yet (use headless GraphQL adapters + custom `fetch`, or REST)
- Conditional show/hide is **client UX only** (not a security boundary)

## Security checklist

1. Keep headless **off** until intentionally enabled per form.
2. Set explicit `headless.allowedOrigins` for cross-origin apps.
3. Require **captcha** on public forms.
4. Leave **`allowRawHtml` false** unless HTML fields are trusted CMS content.
5. Do not treat client-side conditional hiding as access control.

## Feedback

Report issues with your **Freeform plugin version** and the installed `@solspace/freeform-*` package versions.
