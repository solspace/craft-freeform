# Summary field

The Pro Summary field displays a read-only review of answers entered before it in the form layout. Place it at the bottom of a single-page form or on the final page of a multi-page form. It does not store a duplicate answer, participate in validation, or add content to email notifications or the submission GraphQL schema.

## Settings

- **Included Field Handles:** leave blank for all supported preceding fields, or enter comma-separated handles (for example `name, email, interests`). The summary follows form order. Unknown handles, fields after the Summary, and unsupported field types are ignored. Update this setting if you rename a selected field handle.
- **Hide Empty Fields:** enabled by default. Disable to show “Not answered” for empty answers and “No” for unchecked checkboxes. Numeric zero is an answer.
- The normal label, instructions, translations, conditional rules, and input attributes apply.

## Display

Text, email, number, phone, website, regex, date/time, choices, cards, ratings, opinion scales, calculations, uploads, and tables are supported. Choices display option labels. Checkboxes show Yes/No. Uploads show a file count, without exposing asset IDs, URLs, or file contents. Tables display one line per row with column labels; file cells also show a count. Groups are traversed in layout order.

Hidden/invisible fields, hidden calculations, passwords, confirmations, payment fields, signatures, decorative fields, and unrecognized custom field types are excluded, even when their handle is explicitly selected. Conditional fields and children of hidden groups are omitted. Answers are escaped text, never executable HTML.

Twig rendering includes a server-rendered `<dl>` with `data-freeform-summary`. Freeform's standard JavaScript updates current-page answers on input, choice changes, calculations, uploads, table edits, and reset. Completed pages use the server's form state and are refreshed when navigating or submitting. Back navigation uses Freeform's existing Back button; this field does not introduce page-jump links. Without JavaScript, the server-rendered review remains available and updates on page requests.

For custom styling, target `[data-freeform-summary]`, its `dt`/`dd` elements, or `[data-summary-field="handle"]`. Custom templates must render the field's input and retain the standard `data-field-container`/`data-hidden` attributes for live conditional visibility.

## Headless

The manifest uses renderer `summary` and provides `frontend.config.fields`, `hideEmpty`, and translated display labels. The built-in React and Vue renderers derive the review from current runtime values and conditional visibility, including hidden parent groups. No extension or `allowRawHtml` is needed. Custom renderers can call `getSummaryEntries(field, form)` from `@solspace/freeform-core`.

Summary entries contain untrusted text, not sanitized HTML. The built-in headless renderers display labels and answers literally, including any markup. Custom renderers must use escaped text interpolation or `textContent` for both `entry.label` and `entry.text`, never `innerHTML`, `v-html`, or `dangerouslySetInnerHTML`.

Formie imports create a native Summary field using Freeform's defaults. Review the imported field selection and empty-answer settings; Formie's custom summary template/settings are not migrated.
