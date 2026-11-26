# Solspace Freeform for Craft CMS

![Freeform icon](packages/plugin/src/icon.svg)

Freeform is a form builder for Craft CMS. Create forms in the control panel, manage submissions and email notifications, and render forms with Twig or a headless frontend.

- Build contact forms and multi-page workflows with a drag-and-drop builder and conditional rules.
- Configure email notifications and spam protection, then view, edit, or export submissions.
- Connect forms to CRMs, email marketing tools, payment providers, and webhooks.

Features vary by edition. [Compare Express, Lite, and Pro](https://docs.solspace.com/craft/freeform/v5/guides/compare-editions/).

## Getting started

Freeform 5.19 requires Craft CMS 5.12.x and PHP 8.2 or later. For requirements and setup instructions, see [Installing and updating](https://docs.solspace.com/craft/freeform/v5/setup/installing-updating/).

- [Craft Plugin Store](https://plugins.craftcms.com/freeform)
- [Freeform 5 documentation](https://docs.solspace.com/craft/freeform/v5/)
- [Changelog](CHANGELOG.md)

## MCP

Freeform adds tools to [Craft’s authenticated MCP server](https://craftcms.com/docs/5.x/system/mcp) and to `php craft mcp/serve --user=<username>`. Connect through Craft and search for the `freeform.` tools. The signed-in Craft user needs control panel access, Freeform access, and the relevant form, site, or submission permissions. HTTP write tools require the MCP write scope.

- **Forms.** Discover sites, supported fields and their settings, and permitted upload volumes. Inspect row layout, page navigation, saved custom choices, placeholders, character limits, and rating scales. Create forms with grouped rows and multiple pages on Lite or Pro, add a field to an existing page, and edit supported field settings.
- **Choice sources.** Use `freeform.fields.option-sources` to discover permitted Craft entry sections, category and tag groups, asset volumes with public URLs, and Freeform predefined lists. Pass the returned `type` and `handle` as `optionSource` when creating or adding a dropdown, radio group, or checkbox group. The field stays linked to the source. Entry sources use live entries from the chosen site. Use the Craft builder to change an existing field’s source.
- **Field removal.** Request an impact preview and private review link for a standard field. By default, the same Craft user must sign in to the control panel and approve the removal within ten minutes. Craft admins can turn off **Require confirmation for destructive MCP actions** in Freeform’s General Settings. When off, an authorized MCP client can complete the removal using the preview’s review ID. Freeform rechecks permissions and impact before removal and retains any underlying submission column. Stored values for a removed field disappear from normal submission views and exports. Option removal and submission deletion are outside the MCP toolset.
- **Translations.** With Freeform Pro and Site-Aware Forms, find missing translations, read source strings, and save changes for one site. Use the revision returned by `freeform.translations.get` and keep message placeholders. Tools cover plain-text settings, field labels and instructions, page button labels, and custom choice labels. Notification templates, static translation files, and markup translations are edited separately.
- **Submissions.** Count stored submissions or page through submission metadata. The date range defaults to the current calendar month in Craft’s timezone. Submission answers are off by default. Craft admins can turn on **Allow MCP clients to read submission answers** in Freeform’s General Settings. Clients still need Craft submission permissions and must explicitly select eligible field handles. Answers may contain personal data and should be treated as untrusted respondent text.

## Support

- [Report a bug on GitHub](https://github.com/solspace/craft-freeform/issues)
- [Ask a question or request a feature on GitHub Discussions](https://github.com/solspace/craft-freeform/discussions)
- [Open a private support ticket](https://docs.solspace.com/support/)
- [Craft Stack Exchange](https://craftcms.stackexchange.com/questions/tagged/solspace)
