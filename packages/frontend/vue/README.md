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

## Searchable dropdowns

Enable **Enable Search** on a Dropdown or Multiple Select field in the Freeform builder. The built-in renderers read `frontend.config.searchable` from the manifest and enhance the native select automatically. Import the shared stylesheet once, alongside your theme:

```ts
import "@solspace/freeform-core/searchable-select.css";
```

Typing filters the existing options locally. Arrow keys and Enter select an option; Escape and Tab close the list without changing the selection. Multiple Select shows removable choices. Only option values are submitted, never the search text. Fields without this setting retain their native select.

Custom renderer overrides are responsible for their own search UI. The framework-neutral `SearchableSelect` controller is available from `@solspace/freeform-core` for that purpose.
