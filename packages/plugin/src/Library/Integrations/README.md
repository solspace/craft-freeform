# Content and navigation integrations

Freeform registers optional authoring integrations for CKEditor, Vizy, Navigation,
Craft Link, Hyper, and Linkit. Installing Freeform does not change existing fields,
entry types, menus, or project config. Enable the editor controls on the fields
where authors should be able to embed forms.

## Content Integrations settings

Open **Freeform → Settings → Content Integrations** to review the six supported
content integrations. Each row uses the plugin’s color logo and shows the supported version range, installed
version, availability, and an authoring toggle. Missing or disabled plugins are
dimmed. Unsupported versions stay in full color with amber warnings. These
unavailable integrations cannot be enabled here. Supported integrations default to
on; **Enable all** / **Disable all** changes the available integrations together. Turning one off preserves saved form references and frontend rendering.
Editor insertion buttons are hidden while off; existing link/node pickers keep
their selections but do not allow new form choices. Existing manual embedding
recipes remain ordinary project content.

Both native editor blocks show a static form skeleton with the selected form's
name and the shared integration icon. The preview has no interactive form inputs
and is not saved as authored content. Frontend rendering still uses the selected
form's real fields and template.

The single **Integration Icon** setting applies to Freeform toolbar controls and
form pickers across these plugins. It defaults to the Freeform logo. Choose a
Craft system icon, or use **Use Freeform logo** to restore the default. Host
plugin menus that display text-only type labels continue using their own layout.
Settings use the normal Freeform settings permissions and Project Config rules.
No migration or Project Config rewrite is required. Missing settings assume all
supported integrations enabled and the Freeform logo; absent integration keys
retain that default. Preferences are persisted through the normal settings save.

## Supported plugins and content types

| Integration | Supported versions | Freeform support | Front-end rendering |
| --- | --- | --- | --- |
| Craft Link | Native Link field on Craft 5 | Registered **Freeform Form** link type | Resolve the field with `craft.freeform.formFromLink()` |
| Hyper | 2.x and 3.x on Craft 5 | Registered **Freeform Form** link type | Resolve an individual Hyper link with `formFromLink()`; `link.form` is also available |
| Linkit | 5.x on Craft 5 | Registered **Freeform Form** link type | Resolve the Linkit field with `formFromLink()`; `link.form` is also available |
| CKEditor | 5.9+ on Craft 5 | Registered **Freeform Form** toolbar plugin | `craft.freeform.renderContent(entry.body)` |
| Vizy | 4.x on Craft 5 | Registered **Freeform Form** node and toolbar control | Normal Vizy field `.render()` |
| Vizy content blocks | 3.x and 4.x on Craft 5 | Optional recipe using a Freeform Craft field inside a project-defined block | Block template including `freeform-integrations/vizy` |
| Navigation | 3.x and 4.x on Craft 5 | Registered **Freeform Form** node type | Resolve the node with `formFromLink()` and render it in your menu template |

These optional content recipes and link/navigation adapters target Craft 5. See the
[form-link guide](Links/README.md) for field configuration and link examples.
Form selections store a reference to a form. Your site template determines
whether to render it inline, inside a disclosure, or in a modal; the selection
does not generate a public form URL.

The `freeform-integrations` site template root is supplied by Freeform; you do
not need to copy its templates into your project. Each block resolves a separate
form instance so the same form can be embedded more than once on a page. The
templates render nothing for empty, archived, or deleted selections. Forms keep
their own formatting templates; load any CSS required by those templates in your
site layout. Render properties can override the formatting template as usual.

## Native editor controls

### CKEditor 5.9+

Add **Freeform Form** (`freeformForm`) to the CKEditor field's toolbar in its
settings. Authors click it to pick a form. The editor inserts a selectable block;
select that block and click the toolbar button again to change its form. Editor
Undo/Redo, moving, copying, and deleting the block use CKEditor's native model.

Render the field through the helper:

```twig
{{ craft.freeform.renderContent(entry.body) }}
{# Optional render properties apply to each embedded form. #}
{{ craft.freeform.renderContent(entry.body, {
    formattingTemplate: 'bootstrap-5/index.twig'
}) }}
```

CKEditor stores an empty `<div data-freeform-form="5"></div>` placeholder. The
helper replaces only these canonical placeholders; it never evaluates content
as Twig. Normal `{{ entry.body }}` output leaves the placeholders empty. Keep the
Freeform toolbar control enabled when editing fields containing these blocks.

### Vizy 4

In the field's Editor Config, enable the **Freeform Form** node and put its
control on the toolbar. Authors use the same picker to insert a native atomic
node, or select an existing node and click the control to change its form. No
project-defined Vizy block type or additional Craft field is required.

```twig
{{ entry.body.render() }}
```

Vizy saves a `freeformForm` node with a `formId` attribute. Freeform renders the
form through Vizy's supported PHP node renderer. Optional Vizy node templates
can override the presentation, as with other custom Vizy nodes. Forms use their
configured formatting templates; load the corresponding CSS in the site layout.

Both controls share the existing form picker's allowed-form policy, preserve
unavailable selections while editing, and render nothing for archived/deleted
forms. Each occurrence receives its own form and field IDs. Existing nested
entries/content blocks remain supported and are not converted automatically.

## Optional CKEditor nested-entry recipe

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

### Optional button and modal example

The disclosure example above works without JavaScript. To open a form in a
modal, your site template can render a button and a native `<dialog>`, with the
JavaScript below providing the opening and closing behavior. Freeform supplies
the selected form; this presentation belongs to the site template.

This complete example renders top-level menu items. For a nested menu, apply
the same button logic within your existing node loop.

```twig
{% set nodes = craft.navigation.nodes('mainMenu').level(1).all() %}

<nav aria-label="Main navigation">
    <ul>
        {% for node in nodes %}
            {% set form = craft.freeform.formFromLink(node) %}
            <li>
                {% if form %}
                    <button type="button"
                            data-freeform-dialog-open="form-dialog-{{ node.uid }}"
                            aria-haspopup="dialog">
                        {{ node.title }}
                    </button>
                {% elseif node.url %}
                    {{ node.link }}
                {% else %}
                    <span>{{ node.title }}</span>
                {% endif %}
            </li>
        {% endfor %}
    </ul>
</nav>

{# Keep the form markup outside navigation lists and interactive controls. #}
{% for node in nodes %}
    {% set form = craft.freeform.formFromLink(node) %}
    {% if form %}
        <dialog id="form-dialog-{{ node.uid }}"
                data-freeform-dialog
                aria-labelledby="form-title-{{ node.uid }}">
            <h2 id="form-title-{{ node.uid }}">{{ node.title }}</h2>
            <button type="button" data-freeform-dialog-close>Close</button>
            {% include 'freeform-integrations/_form' with {
                selectedForm: form,
                instanceId: 'navigation-' ~ node.uid,
                renderProperties: {},
            } only %}
        </dialog>
    {% endif %}
{% endfor %}
```

Place the following script after the dialogs. Native dialogs handle Escape and
keep keyboard focus inside the open modal. The close handler returns focus to
the menu button. Load the CSS required by each form's formatting template, and
style the dialog to suit your site.

```html
<script>
const formDialogTriggers = new WeakMap();

document.querySelectorAll('[data-freeform-dialog-open]').forEach(button => {
    button.addEventListener('click', () => {
        const dialog = document.getElementById(button.dataset.freeformDialogOpen);
        if (!dialog) return;
        formDialogTriggers.set(dialog, button);
        dialog.showModal();
    });
});

document.querySelectorAll('[data-freeform-dialog]').forEach(dialog => {
    dialog.querySelector('[data-freeform-dialog-close]')
        .addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => formDialogTriggers.get(dialog)?.focus());
});
</script>
```

## Upstream references

- [CKEditor nested entries and element partials](https://github.com/craftcms/ckeditor#longform-content-with-nested-entries)
- [Vizy block type templates](https://verbb.io/craft-plugins/vizy/docs/v4/template-guides/block-type-templates)
- [Navigation custom node types](https://verbb.io/craft-plugins/navigation/docs/developers/node-types)
