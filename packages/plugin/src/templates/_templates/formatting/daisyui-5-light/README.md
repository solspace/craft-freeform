# daisyUI 5 Light and Dark

Two Freeform sample formatting templates share this implementation. The light template sets `data-theme="light"` on the form and the dark template sets `data-theme="dark"`. Both register the `DaisyUI5Bundle` asset bundle.

The bundle includes selected daisyUI 5.7.27 component CSS and its light and dark theme variables locally. Component rules are wrapped in CSS `@scope (.ff-daisy-form)` so common classes such as `.btn` and `.input` only affect these forms. It uses CSS nesting, `color-mix()`, OKLCH colors and `:has()`; use current browsers. The upstream MIT license is in `DAISYUI-LICENSE.txt`. To update the vendor CSS, download the component files listed in `_daisyui.css` from the pinned daisyUI version and preserve the scope wrapper and license.

Place the form in any page layout. No Tailwind build, CDN script or sitewide daisyUI stylesheet is required. Keep custom field templates and theme colors compatible with both themes. The included form partials use Freeform's fieldset and legend options for choice groups and Freeform's translated generated options for radio and checkbox labels.
