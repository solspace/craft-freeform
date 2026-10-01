# daisyUI 5 Light

This Freeform sample formatting template has its own Twig partials, JavaScript, light theme CSS and `DaisyUI5LightBundle` asset bundle.

The bundle loads two CSS files: `_daisyui.css` contains selected daisyUI 5.7.27 components, and the minified `_main.css` contains the light theme, Steps and Card components, and Freeform-specific styles. The Steps and Card rules expand upstream `@apply` utilities so they work without a Tailwind build. Component rules are wrapped in CSS `@scope (.ff-daisy-form)` so common classes such as `.btn` and `.input` only affect this form. It uses CSS nesting, `color-mix()`, OKLCH colors and `:has()`; use current browsers. The upstream MIT license is in `DAISYUI-LICENSE.txt`. To update the vendor CSS, download the component files listed in `_daisyui.css` and the Steps and Card components from the pinned daisyUI version, expand their utilities, preserve the scope wrapper and license, and minify the combined theme, Steps, Card and Freeform rules into `_main.css`.

Place the form in any page layout. No Tailwind build, CDN script or sitewide daisyUI stylesheet is required. The included form partials use Freeform's fieldset and legend options for choice groups and Freeform's translated generated options for radio and checkbox labels.
