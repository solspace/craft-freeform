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

## Range Slider

Requires **Freeform Pro**.

The built-in `range` renderer supports the Range Slider field's minimum, maximum, step, and default value. Layout is built into the renderer. Use your normal theme assets: the Default theme stylesheet, Bootstrap CSS, or Tailwind utilities. No separate range stylesheet is needed.

The native slider supports keyboard and touch input and displays its current value and bounds. Decimal steps and negative ranges are supported. A slider always has a value, starting at the configured default or minimum; making it required does not require the visitor to move it. Values outside the bounds or off the configured step are rejected by Freeform on submission. With the Default theme, override `--ff-range-accent` to customize the native track and thumb color. Bootstrap uses `form-range`; Tailwind uses the theme’s accent utilities.
