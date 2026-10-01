# @solspace/freeform-theme-tailwind

Official Tailwind starter theme for Freeform (React & Vue). It does **not** ship CSS or a copy of Tailwind.

Designed for React apps already using Tailwind CSS. This package maps Freeform’s form, row, field, input, and button slots to Tailwind utilities, following the classic `tailwind-4-light` formatting template.

**Docs:** [Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [React JS](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/)

## Install

```bash
npm install @solspace/freeform-theme-tailwind @solspace/freeform-react
```

Do **not** import `@solspace/freeform-theme-default/styles.css` on the same form, or BEM styles will fight the utilities.

## Tailwind must see this package

Tailwind only emits classes it finds in scanned files. Point `@source` at the published package (Tailwind 4):

```css
@import "tailwindcss";
@source "../node_modules/@solspace/freeform-theme-tailwind";
```

Tailwind 3 `content`:

```js
content: [
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@solspace/freeform-theme-tailwind/dist/**/*.js",
],
```

## Usage

```tsx
import { Freeform } from "@solspace/freeform-react";
import { tailwindTheme } from "@solspace/freeform-theme-tailwind";

export function ContactForm() {
  return (
    <Freeform
      handle="contact"
      baseUrl="https://cms.example.com"
      theme={tailwindTheme}
    />
  );
}
```

### Light / dark

`tailwindTheme` is the light map (indigo / gray, matching classic Tailwind 4 light). Use `tailwindDarkTheme` when your page is already dark.

```tsx
import {
  tailwindDarkTheme,
  tailwindTheme,
} from "@solspace/freeform-theme-tailwind";

<Freeform theme={isDark ? tailwindDarkTheme : tailwindTheme} />;
```

### Override a few classes

```tsx
import { createTheme } from "@solspace/freeform-theme-tailwind";

const theme = createTheme({
  classNames: {
    submitButton: "rounded-full bg-teal-600 px-6 py-2 text-white",
  },
  classNamesByType: {
    checkbox: { optionInput: "size-4 rounded-sm border-teal-600" },
  },
});
```

## What you get

- Equal-width row columns (`flex` + `flex-1`)
- Distinct styles for text, select, checkbox, radio, file, and payment hosts
- Invalid fields pick up a red outline
- Hidden / Mollie fields stay off-layout

Override `classNames` or `classNamesByType` to match your brand. This package does not add a Tailwind runtime or a second design token set.
