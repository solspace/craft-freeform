# Freeform form links

On Craft 6, Freeform registers **Freeform Form** with Craft's native Link field,
Hyper (2.x and 3.x), and Linkit 5 when those plugins are installed. Optional plugins must provide compatible link APIs. No additional Composer dependencies are required.

Enable the type in the link field's settings, then choose which forms authors
may select. The picker follows the existing **Show only allowed forms** Freeform
setting, excludes archived forms, and uses the current site's forms.

These links store form references, like Formie's form link integration. They
do not generate a public URL or an anchor tag. A form can appear on more than
one page, so your template decides where and how to display it.

## Templates

Use the same helper with any of the three link fields:

```twig
{% set form = craft.freeform.formFromLink(entry.myLinkField) %}
{% if form %}
    {{ form.render() }}
{% endif %}
```

For a Hyper field, pass an individual link (for example,
`entry.myHyperField.first()`) or loop through its links. Hyper and Linkit links
also expose the selected form directly as `link.form`.

The helper accepts optional render properties:

```twig
{% set form = craft.freeform.formFromLink(link, {id: 'footer-contact-form'}) %}
```

The helper also accepts Navigation's **Freeform Form** nodes directly. See the
[content and navigation integration guide](../README.md) for Navigation, CKEditor,
and Vizy setup and the bundled rendering templates.

Native Craft LinkData cannot expose a custom `form` property. Its `value` is a
rendered URL, so use `formFromLink()` rather than passing `link.value` to
`craft.freeform.form()`.

Deleted, archived, and unresolvable form references return `null`. An unavailable
saved selection remains visible as **Unavailable form** in the picker so editing
another field does not silently clear it; choose another form or explicitly clear
it before saving. Form IDs are stored in the owning field's content, rather than
Craft's element relations, because Freeform forms are not Craft elements.
