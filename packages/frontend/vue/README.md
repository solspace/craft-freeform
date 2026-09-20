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
## International Phone fields

Enable **Use international phone input** on an existing Pro Phone field. It is off by default and replaces its fixed pattern/mask only when enabled. Choose a default country and optionally enter allowed two-letter country codes (for example `US, CA, GB`). An empty allowed list enables all supported countries; an invalid nonempty list permits none.

The country picker sits inside the phone input as a flag button. Its full-width dropdown shows country flags and names with right-aligned dialing codes, searches country names/codes/dialing codes, supports keyboard use, and supplies country-specific example placeholders unless a custom placeholder is configured. Valid numbers are formatted on blur and submitted as a single E.164 string, such as `+442079460018`. Letters and extensions are rejected. Server validation enforces both number validity and the allowed countries, including for headless/API requests. With JavaScript disabled, use a full international number or a national number in the configured default country.

React and Vue include the picker without a separate extension or stylesheet import. The manifest supplies `frontend.config.international`, `defaultCountry`, `allowedCountries`, translated `labels`, and `examples`. Custom renderers can use `mountInternationalPhone` from core; pass value changes to the form runtime and call `update()` for external changes and `destroy()` on unmount. Custom styles can set `--ff-phone-background`, `--ff-phone-color`, `--ff-phone-border`, `--ff-phone-selector-background`, `--ff-phone-highlight`, and `--ff-phone-dial-color`. Flags use the device’s emoji font. Classic forms load the phone script only when an opted-in field is present. No third-party lookup or geolocation service is contacted.

The plugin requires `giggsey/libphonenumber-for-php-lite` (installed by Composer); headless core uses `libphonenumber-js`. Keep their number metadata updated when upgrading dependencies.
