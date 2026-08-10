# @solspace/freeform-react-theme-default

Default Freeform React theme. Provides CSS for the semantic `ff-*` classes used by `@solspace/freeform-react`, including:

- **Equal-split row columns** (same layout model as Freeform Twig flexbox formatting templates)
- **Light + dark color schemes** via CSS variables

**Docs:** [Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [React JS](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/)

## Install

```bash
npm install @solspace/freeform-react-theme-default @solspace/freeform-react
```

## Usage

```tsx
import { Freeform } from "@solspace/freeform-react";
import "@solspace/freeform-react-theme-default/styles.css";

export function ContactForm() {
  return <Freeform handle="contact" baseUrl="https://cms.example.com" />;
}
```

By default the form follows the visitor’s OS preference (`prefers-color-scheme`).

### Force light or dark

```tsx
import { Freeform } from "@solspace/freeform-react";
import {
  lightTheme,
  darkTheme,
} from "@solspace/freeform-react-theme-default";
import "@solspace/freeform-react-theme-default/styles.css";

<Freeform handle="contact" baseUrl="..." theme={darkTheme} />;
// or
<Freeform handle="contact" baseUrl="..." theme={lightTheme} />;
```

Or with `createTheme`:

```tsx
import { createTheme } from "@solspace/freeform-react-theme-default";

const theme = createTheme({ defaults: { colorScheme: "dark" } });
```

You can also add `ff-form--light` / `ff-form--dark` via `className` if you prefer not to use the theme object.

### Customize tokens

Override CSS variables on `.ff-form` (or a parent):

```css
.ff-form {
  --ff-color-primary: #0f766e;
  --ff-color-primary-hover: #0d9488;
  --ff-radius: 8px;
}
```

Multi-field rows sit side-by-side on desktop and stack under `800px`, matching Freeform’s Twig behavior.
