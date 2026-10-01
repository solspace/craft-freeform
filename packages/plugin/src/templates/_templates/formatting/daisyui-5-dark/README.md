# daisyUI 5 Dark

This Freeform sample formatting template has its own Twig partials, JavaScript, dark theme CSS and `DaisyUI5DarkBundle` asset bundle. The JavaScript passes the dark palette to Stripe Elements through its Appearance API.

The formatting bundle loads only the minified `_main.css`, which contains the dark theme, Steps and Card components, and Freeform-specific styles. The Steps and Card rules expand upstream `@apply` utilities so they work without a Tailwind build. Your site must also load compatible daisyUI component CSS (version 5.7.27 for the included sample). The Freeform demo and built-in HTML embed automatically load the included `_daisyui.css` through `DaisyUI5DarkComponentsBundle`; ordinary site pages do not. If your site does not already load daisyUI, register that component bundle in your page layout before rendering the form. The included component rules are wrapped in CSS `@scope (.ff-daisy-form)` so common classes such as `.btn` and `.input` only affect this form. The CSS uses nesting, `color-mix()`, OKLCH colors and `:has()`; use current browsers. The upstream MIT license is in `DAISYUI-LICENSE.txt`. To update the vendor CSS, download the component files listed in `_daisyui.css` and the Steps and Card components from the pinned daisyUI version, expand their utilities, preserve the scope wrapper and license, and minify the combined theme, Steps, Card and Freeform rules into `_main.css`.

Place the form in any page layout with compatible daisyUI CSS. The included `_daisyui.css` is already compiled, so it does not require Tailwind's browser script or a Tailwind build. The included form partials use Freeform's fieldset and legend options for choice groups and Freeform's translated generated options for radio and checkbox labels.

To use the included CSS on a page without its own daisyUI build, register the components before rendering the form:

```twig
{% do view.registerAssetBundle('Solspace\\Freeform\\Resources\\Bundles\\FormattingTemplates\\DaisyUI5DarkComponentsBundle') %}
```
