# @solspace/freeform-vue

Vue 3 adapter for Solspace Freeform headless forms.

## Install

```bash
npm install @solspace/freeform-vue @solspace/freeform-core @solspace/freeform-extensions
```

Load the default theme CSS:

```bash
npm install @solspace/freeform-theme-default
```

```ts
import "@solspace/freeform-theme-default/styles.css";
```

## Usage

```vue
<script setup lang="ts">
import { Freeform } from "@solspace/freeform-vue";
import { recommendedExtensions } from "@solspace/freeform-extensions";

const baseUrl = "https://cms.example.com";
</script>

<template>
  <Freeform
    handle="contact"
    :base-url="baseUrl"
    :extensions="recommendedExtensions"
  />
</template>
```

### Headless composable

```vue
<script setup lang="ts">
import { useFreeform } from "@solspace/freeform-vue";

const form = useFreeform({
  handle: "contact",
  baseUrl: "https://cms.example.com",
});
</script>

<template>
  <div v-if="form.loading">Loading…</div>
  <form v-else @submit.prevent="form.handleSubmit">
  </form>
</template>
```

## Docs

[Getting Started](https://docs.solspace.com/craft/freeform/v5/headless/getting-started/) · [Vue.js](https://docs.solspace.com/craft/freeform/v5/headless/vuejs/) · [React JS](https://docs.solspace.com/craft/freeform/v5/headless/reactjs/) (API parity)
## Character counts

Enable **Show character count** on a Text or Textarea field to show its current length. When a maximum length is configured, the counter also displays the limit (for example, `120 / 500 characters`). Without a maximum, it shows the count alone. The option is off by default.

The manifest exposes `frontend.config.showCharacterCount` and translated `characterCountMessages`; the maximum comes from `validation.maxLength`. React and Vue include the layout and use existing theme assets, with `characterCount` and `characterCountError` class-name overrides. No additional stylesheet import is needed. Counters update with controlled values, including the form API's `reset()` method. They are associated with the input using `aria-describedby` and do not announce every keystroke.

Counts follow native HTML `maxlength` semantics (UTF-16 units, with normalized line endings), so some emoji count as more than one unit. Server-side maximum-length validation uses the same convention. Classic Twig counters initialize with Freeform's JavaScript and update on input, change, reset, and AJAX replacement. Dispatch an `input` or `change` event after setting a value in custom scripts.


## Password visibility

Enable **Show Password Toggle** on the Pro Password field to add a Show/Hide button. It is off by default. The input remains masked initially and is masked again on native form reset or when its controlled value is cleared. The manifest supplies `frontend.config.showPasswordToggle` and translated `passwordToggleLabels`. Use the `passwordToggle` theme class override to customize the button. No extra stylesheet is required; password storage and submission behavior are unchanged.

## Email typo suggestions

Enable **Suggest email corrections** on an Email field to offer corrections for common domain typos after the visitor leaves the field. It is off by default. For example, `Jane+sales@gmial.com` prompts “Did you mean Jane+sales@gmail.com?” with a **Use suggestion** button. The address changes only when that button is activated. Suggestions never block submission or replace server-side validation.

Suggestions use a small, explicit list of common provider-domain typos; arbitrary company domains, regional domains, multiple addresses, quoted addresses, and internationalized local parts are not guessed. The local part, including capitalization and plus-addressing, is preserved. No network requests or new runtime dependencies are required. Suggestions clear on edits, external value changes, and form reset. Read-only/disabled fields are not changed.

The manifest exposes `frontend.config.suggestEmailCorrections` and translated `emailSuggestionLabels`. React and Vue include the behavior automatically. Classic forms bundle it with Freeform core JavaScript. No additional stylesheet import is needed; customize `--ff-email-suggestion-color` and `--ff-email-suggestion-action`. Custom renderers can use `getEmailSuggestion()` or `mountEmailSuggestions()` from core; pass accepted values to the form runtime, call `clear()` after external value updates, and call `destroy()` on unmount.
