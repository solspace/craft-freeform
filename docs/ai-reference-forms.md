# Create a form from a PDF or image

Freeform's **Create with AI** can use a reference form to create editable native Freeform fields. It uses an enabled AI integration already configured in Freeform; no separate API key is needed.

## Use a reference

1. Open **Forms → Create with AI** and choose a configured AI integration.
2. Attach or drop a PDF, PNG, or JPEG of the form. You may attach up to five files, with a combined size of 10 MiB. Use the arrow buttons to put multiple files in reading order.
3. Optionally add instructions, such as “Only recreate pages 1–2” or “Omit the office-use section,” and a form name.
4. Click **Generate form**. The new form opens in the builder for review and editing.

The generator attempts to preserve labels, choices, required indicators, headings, page order, and rows of up to four fields. Large fields and headings occupy their own rows. It attempts to omit filled-in answers and signatures; generated default values are cleared. Static reference content is sanitized and cannot enable Twig processing.

For supported fillable PDFs, Freeform also reads embedded dropdown and multiple-select definitions, including choices that are hidden when the menu is closed. These definitions are supplied to every compatible provider. Fields the AI links to a definition retain the source choice type, option order, and separate display labels/export values when the form is created. Explicit instructions to change a field's type or choices can override the source definition.

Images, flattened PDFs, and PDFs whose internal structure cannot be read use visual recognition. Dropdowns with no recoverable choices may be created with an empty option list for you to complete; the AI is instructed not to invent choices. Embedded-field extraction currently supports standard PDF cross-reference tables; compressed object/cross-reference streams and XFA forms fall back to visual recognition. Extraction is bounded by document complexity and metadata size, so unusually large definitions may also be omitted.

This is a starting point, rather than an exact visual copy. Review field types, required settings, labels, choices, dates, and page/column layout. Styling, logos, integrations, notifications, conditional rules, calculations, and other behavior must be configured separately. Unclear scans and very complex forms may need several passes or smaller sections. Generation is limited to 20 pages and 200 fields.

## Integration compatibility

SolspaceAI supports PDF and image references using the existing authorized account and credit balance, with the model selected by the hosted service. No separate provider key or model setting is needed. Reference requests follow normal SolspaceAI usage billing; document size and page count affect usage.

For other providers, attachment controls use the selected integration's configured model. Recognized vision/document model families are supported for OpenAI, Anthropic, and Gemini. Older Claude 3 models support images only. Text-only, unknown/custom model identifiers, and specialized audio/image-generation models may not offer attachments. Text-based form generation remains available for existing integrations, including integrations that do not implement attachment support.

Your provider must also support the native PDF/image request format and the document's page count. PHP's `upload_max_filesize`, `post_max_size`, and `max_file_uploads`, proxy/request limits, provider context limits, account access, or quotas may impose smaller limits. Password-protected PDFs, unsupported formats, empty files, and images larger than 20 megapixels or 10,000 pixels per side are rejected. Convert encrypted PDFs to an unprotected copy before attaching them.

For SolspaceAI operators: the proxy must retain a document-capable default model. To accommodate the full 10 MiB of uploads, allow at least a 16 MiB JSON request body for `/v1/chat/completions` (files are base64 encoded) and a proxy response timeout longer than Freeform’s 120-second request timeout. Smaller proxy limits still apply even when Freeform accepts the files.

## Timeouts and gateway errors

Form generation waits up to 120 seconds for the AI provider. Freeform raises a shorter PHP execution limit to 150 seconds for this request and uses low reasoning effort for compatible GPT-5/6 models during form generation. Your selected model stays the same; other AI workflows retain their normal reasoning settings.

PHP-FPM, nginx, a reverse proxy, or your hosting provider can enforce a separate timeout that Freeform cannot change. If generation still fails with a 502/504 after roughly 30–60 seconds, check the PHP and web-server logs and allow those request limits to exceed the AI timeout. A faster model or fewer reference pages can also help. Check the Forms list before retrying after a lost connection, because the original request may still finish creating the form. Freeform does not automatically retry generation requests.

## Files and permissions

The reference files are sent to the selected AI provider using the integration's existing credentials. Choose suitable files for that provider and its data policies. Freeform reads PHP's temporary uploads for this request; it does not create Craft assets or retain permanent reference copies. PHP removes temporary uploads at the end of the request. A failed generation keeps the selected files in the open dialog so you can retry.

Local PDF metadata extraction reads choice definitions, not selected/default answers, scripts, actions, or external resources. The extracted data is treated as untrusted reference content and remains subject to the same output sanitization. The original attachment is still sent to the provider, including any answers it contains; use a blank copy when those details should not be shared.

The feature retains the existing Lite-or-higher creation requirement and requires both **Create Forms** and **Access Integrations** permissions in the control panel. Upload content, MIME types, counts, sizes, and model compatibility are also checked on the server. CSRF protection uses Craft's existing authenticated API workflow.

Third-party AI integrations can opt in by implementing `ReferenceAiIntegrationInterface::getReferenceMimeTypes()` and handling `ReferenceFile[]` in the existing `processAiRequest()` options under `referenceFiles`. Existing `AiIntegrationInterface` implementations are unchanged.
