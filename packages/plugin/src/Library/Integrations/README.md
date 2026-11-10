# Content and navigation integrations

Freeform includes render templates for CKEditor's native nested entries and Vizy
blocks, and registers a **Freeform Form** node type with Navigation on Craft 5.
These plugins remain optional. Installing Freeform does not change existing
fields, entry types, menus, or project config.

The `freeform-integrations` site template root is supplied by Freeform; you do
not need to copy its templates into your project. Each block resolves a separate
form instance so the same form can be embedded more than once on a page. The
templates render nothing for empty, archived, or deleted selections. Forms keep
their own formatting templates; load any CSS required by those templates in your
site layout. Render properties can override the formatting template as usual.

## CKEditor (5.x on Craft 5.9+)

Use CKEditor's native **nested entries**, which preserve forms as structured
content alongside rich text:

1. Create a **Freeform Form** Craft field with the handle `freeformForm`. Choose
   which forms authors can select in its settings.
2. Create an entry type named **Freeform Form**, with a handle of `freeformForm`.
   Add the field to its layout. Disable the title field and use a suitable title
   format, such as `Form`, if authors do not need a separate title.
3. Add that entry type to your CKEditor field and add the **+** toolbar menu.
   CKEditor also lets you show the entry type as an individual toolbar button.
4. Create `templates/_partials/entry/freeformForm.twig`:

   ```twig
   {% include 'freeform-integrations/ckeditor' %}
   ```

5. In an entry, use **+ → Freeform Form**, select a form in the slideout, and
   save. Render the CKEditor field normally: `{{ entry.body }}`.

If your entry type has another handle, name the partial after that handle.
If your field has another handle, pass it explicitly:

```twig
{% include 'freeform-integrations/ckeditor' with {
    freeformFieldHandle: 'contactForm',
    renderProperties: {formattingTemplate: 'bootstrap-5/index.twig'},
} %}
```

This uses Craft 5's entry partial rendering and CKEditor's nested-entry
support. It does not insert literal form markup into the rich text editor or
depend on a custom CKEditor JavaScript extension.

## Vizy (3.x and 4.x on Craft 5)

1. Create or reuse the `freeformForm` **Freeform Form** Craft field above.
2. Create a **Freeform Form** Vizy block type and add the field to its layout.
   In Vizy 3, block types belong to each Vizy field. In Vizy 4, create the shared
   block type under **Settings → Vizy → Block Types**, then allow it in your
   field's Block Configuration.
3. Set the block type's **Template** to `freeform-integrations/vizy`.
4. Insert the block in your content, choose a form, and save the owning entry.
   Render the Vizy field normally: `{{ entry.body.render() }}`.

For a different field handle or render properties, assign your own wrapper
template to the block type:

```twig
{% include 'freeform-integrations/vizy' with {
    freeformFieldHandle: 'contactForm',
    renderProperties: {formattingTemplate: 'bootstrap-5/index.twig'},
} %}
```

The supplied template supports Vizy 3's direct field variables and Vizy 4's
`block` object. Disabled blocks are skipped by Vizy's own renderer.

## Navigation (3.x and 4.x on Craft 5)

1. Install Navigation and Freeform, then open your menu builder.
2. Enable **Freeform Form** in the menu's allowed node types if the menu limits
   them. Add a **Freeform Form** node and choose a form.
3. Supply a title, or leave it blank in Navigation 4 to use the form name.
   Navigation 3's quick-add requires a title. The selected form can also be
   changed in the node's editing slideout.

The picker excludes archived forms and follows Freeform's **Show only allowed
forms** setting. Existing unavailable selections stay visible until changed;
saving an unavailable or empty selection reports a validation error. The form
reference is stored in the node's `data.freeformForm` as `freeform:<id>`.

Forms have no public URL. The node type returns `null` for its URL and does not
pretend to be a Craft element relation. Use `formFromLink()` with the node in
your custom navigation template:

```twig
{% set nodes = craft.navigation.nodes('mainMenu').all() %}
<ul>
{% nav node in nodes %}
    <li>
        {% set form = craft.freeform.formFromLink(node) %}
        {% if form %}
            {# Accessible disclosure example, with its own form instance. #}
            {% include 'freeform-integrations/navigation' %}
        {% elseif node.url %}
            {{ node.link }}
        {% else %}
            <span>{{ node.title }}</span>
        {% endif %}
        {% ifchildren %}<ul>{% children %}</ul>{% endifchildren %}
    </li>
{% endnav %}
</ul>
```

The supplied Navigation partial uses native `<details>` / `<summary>` elements.
You can instead render `form` in a modal or another location using your site's
own markup and JavaScript. Navigation's automatic menu renderer cannot decide
how a form should open; a custom navigation template is required for form UI.
You can also get the form with `node.nodeType().form`. Deleted or archived forms
resolve to `null`, and ordinary Navigation nodes return `null` from the helper.

## Upstream references

- [CKEditor nested entries and element partials](https://github.com/craftcms/ckeditor#longform-content-with-nested-entries)
- [Vizy block type templates](https://verbb.io/craft-plugins/vizy/docs/v4/template-guides/block-type-templates)
- [Navigation custom node types](https://verbb.io/craft-plugins/navigation/docs/developers/node-types)
