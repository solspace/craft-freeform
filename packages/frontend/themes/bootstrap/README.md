# @solspace/freeform-theme-bootstrap

Official Bootstrap 5 starter theme for Freeform (React & Vue). It does **not** ship CSS or a copy of Bootstrap.

Designed for React apps already using Bootstrap 5. This package maps Freeform’s form, row, field, input, and button slots to Bootstrap classes, following the classic `bootstrap-5` and `bootstrap-5-dark` formatting templates.

**Docs:** [Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [React JS](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/)

## Install

```bash
npm install @solspace/freeform-theme-bootstrap @solspace/freeform-react bootstrap
```

Do **not** import `@solspace/freeform-theme-default/styles.css` on the same form, or BEM styles will fight Bootstrap.

## Load Bootstrap CSS

Your app must include Bootstrap 5 styles (CDN, Sass, or a bundler import):

```ts
import "bootstrap/dist/css/bootstrap.min.css";
```

Optional — checked states for **opinion scale** and **cards**:

```ts
import "@solspace/freeform-theme-bootstrap/styles.css";
```

## Usage

```tsx
import { Freeform } from "@solspace/freeform-react";
import { bootstrapTheme } from "@solspace/freeform-theme-bootstrap";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl="https://cms.example.com"
      theme={bootstrapTheme}
    />
  );
}
```

### Light / dark

`bootstrapTheme` is the light map (classic Bootstrap 5). Use `bootstrapDarkTheme` on a dark page (`bootstrap-5-dark`). The form sets `data-bs-theme="dark"` so Bootstrap components inherit dark tokens.

```tsx
import {
  bootstrapDarkTheme,
  bootstrapTheme,
} from "@solspace/freeform-theme-bootstrap";

<Freeform theme={isDark ? bootstrapDarkTheme : bootstrapTheme} />;
```

### Override a few classes

```tsx
import { createTheme } from "@solspace/freeform-theme-bootstrap";

const theme = createTheme({
  classNames: {
    submitButton: "btn btn-success",
  },
  classNamesByType: {
    checkbox: { optionInput: "form-check-input border-success" },
  },
});
```

## What you get

- Bootstrap grid rows (`row` + `col`) with equal-width columns
- `form-control`, `form-select`, `form-check`, and `btn` patterns
- Invalid fields get `is-invalid`
- Form success / error banners use `alert` classes
- Hidden / Mollie fields stay off-layout

Override `classNames` or `classNamesByType` to match your brand. This package does not add a Bootstrap runtime or a second design token set.
