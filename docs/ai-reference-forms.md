# Create a form from a PDF or image

Freeform's **Create with AI** can use a reference form to create editable native Freeform fields. It uses an enabled AI integration already configured in Freeform; no separate API key is needed.

## Use a reference

1. Open **Forms → Create with AI** and choose a configured AI integration.
2. Attach or drop a PDF, PNG, or JPEG of the form. You may attach up to five files, with a combined size of 10 MiB. Use the arrow buttons to put multiple files in reading order.
3. Optionally add instructions, such as “Only recreate pages 1–2” or “Omit the office-use section,” and a form name.
4. Click **Generate form**. Freeform queues generation and checks progress, then opens the new form in the builder for review and editing. You can close the dialog and reopen **Create with AI** in the same browser tab to resume checking progress.

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

The current client starts generation through Craft's queue and polls an owner-only status endpoint. The upload/start request does not wait for the AI provider or form persistence. If its response is lost, the client checks the same request identifier instead of resubmitting generation. Releasing or retrying an interrupted job does not automatically generate another form.

Craft needs a working asynchronous queue runner. The normal control-panel runner is triggered when automatic queue processing is enabled. If the dialog stays queued, check Craft's Queue Manager. For local Herd testing, run this from the **Craft project directory** in another terminal:

```bash
php craft queue/listen
```

A CLI worker avoids nginx/PHP-FPM web-request limits on the runner itself. Production sites should use their normal supervised queue worker. Custom synchronous queue drivers are unsuitable. Web and worker processes must share Craft's private storage and security key; ephemeral or separate worker disks cannot read queued reference files. Jobs reserve up to 240 seconds, while the provider request still times out after 120 seconds. Larger forms can also take time to persist because Freeform creates their content-table columns.

Freeform raises a shorter PHP execution limit to 150 seconds for generation and uses low reasoning effort for compatible GPT-5/6 models. Your selected model stays the same; other AI workflows retain their normal reasoning settings. Provider or hosted SolspaceAI gateway limits still apply independently. A faster model or fewer reference pages can help with those limits.

Known provider output-limit responses are rejected before persistence, including responses containing valid but incomplete JSON. Source-linked dropdowns omit duplicate option data from the AI output; the server restores their original choices. Form persistence uses a transaction and cleanup for failed new forms, though MySQL schema changes can commit implicitly. A forcibly killed worker can still leave work that needs review. If progress cannot be confirmed, check the Forms list and Queue Manager before explicitly starting another request. The client retries status reads only; it never automatically retries a provider call.

## Files and permissions

The reference files are sent to the selected AI provider using the integration's existing credentials. Choose suitable files for that provider and its data policies. To support background generation, Freeform encrypts the prompt and reference data using Craft's security key and stores the request in private `storage/runtime/freeform-ai-generation` files. Queue payloads contain only opaque identifiers, and browser storage retains only the request identifier. No Craft assets are created.

Reference inputs are deleted after normal completion or failure. Unstarted requests expire after 30 minutes. Abandoned encrypted inputs and status files older than one hour are removed during later generation starts or Craft garbage collection. These cleanup processes must run to remove abandoned files. The initiating user's current permissions and site access are rechecked in the worker, its user context is restored afterward, and status responses require that same authenticated owner. A failed generation keeps selected browser files in the open dialog so you can retry; reopening resumes progress tracking but does not restore local file selections.

Local PDF metadata extraction reads choice definitions, not selected/default answers, scripts, actions, or external resources. The extracted data is treated as untrusted reference content and remains subject to the same output sanitization. The original attachment is still sent to the provider, including any answers it contains; use a blank copy when those details should not be shared.

The feature retains the existing Lite-or-higher creation requirement and requires both **Create Forms** and **Access Integrations** permissions in the control panel. Upload content, MIME types, counts, sizes, and model compatibility are also checked on the server. CSRF protection uses Craft's existing authenticated API workflow.

Third-party AI integrations can opt in by implementing `ReferenceAiIntegrationInterface::getReferenceMimeTypes()` and handling `ReferenceFile[]` in the existing `processAiRequest()` options under `referenceFiles`. Existing `AiIntegrationInterface` implementations are unchanged.
