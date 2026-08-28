# AI Spam

AI-based spam analysis for Freeform submissions. This integration sends selected field values to a configured AI integration (e.g. Solspace AI, OpenAI, or Gemini) and flags the submission as spam when the AI response indicates spam.

## Settings
- AI Integration (per-form, required)
- Fields to Analyze (per-form)
- System Prompt (per-form, optional)
- Include Field Labels (per-form)
- Wait for Analysis Before Processing Submission Actions (per-form, **on by default**)
- Display Errors (per-form option)

<span class="note tip">

**NOTE:**
- This integration appears in every form's integration tab but must be manually enabled per form.
- AI parameters (model, max tokens, temperature) are configured in the AI integration settings, not here.
- When **Wait for Analysis Before Processing Submission Actions** is enabled (the default), emails, CRM, webhooks, and other actions wait for AI analysis. If spam is detected, they are not sent. Disable it to analyze spam in the background without delaying notifications.

</span>

## Behavior
The AI Spam Analysis runs **after** the submission is stored.

By default, **Wait for Analysis Before Processing Submission Actions** is enabled:

1. Submission is saved to the database.
2. AI analyzes the selected field content.
3. If **spam** → the submission is marked spam and no email notifications or integrations are run.
4. If **not** spam → email notifications, CRM, webhooks, elements, and other actions are run.

If you disable **Wait for Analysis Before Processing Submission Actions**, AI Spam Analysis runs in the background and may mark the submission as spam later. Notifications and integrations may already have run by then.

## How Spam Is Identified

- Looks for spam indicators like `spam`, `suspicious`, `promotional`, etc.
- Recognizes confidence levels if provided, e.g. `DEFINITELY_SPAM`, `LIKELY_SPAM`, etc.
- Falls back to general spam detection for any response format.
- Only blocks when clear spam indicators are present.

## Example

### Form fields (with "Include Field Labels" enabled)

- Name: `Great Deals Ltd`
- Email: `promos@deals.example`
- Message: `Buy now! Limited time offer. Visit http://spammysite.example for 90% OFF!!`
- Phone: `+1 555 000 1111`

### Result in Spam Reasons

- `AI: Repetitive promotional language with external link [Definitely spam, 9/10]`

## System Prompt Example

You can leave this empty to use the default. To customize the analysis, a good starting prompt is:

> Analyze the following form submission and decide if it is spam. Consider factors like promotional or sales language, excessive links, irrelevant content, suspicious patterns, profanity, or automation signals.

## Known limitations

**Wait for Analysis Before Processing Submission Actions** is **on by default** when you enable AI Spam Analysis on a form. Forms that already saved this setting keep their saved value.

When that setting is enabled, the following applies:

- **Built-in side effects only.** Freeform defers its own outbound actions (email notifications, CRM, webhooks, elements, POST forwarding, and related post-processing). Custom code or plugins that listen directly to `Form::EVENT_AFTER_SUBMIT` are not automatically deferred.
- **Queued AI analysis.** If AI field processing runs through Craft’s queue, notifications and integrations run in the queue worker, not in the original browser request. Ensure your queue is running in production; a stopped or backlogged queue can leave stored submissions waiting for their side effects.
- **Payment forms.** Forms with payment gateways (e.g. Mollie) may need extra verification. Side effects can be tied to both AI completion and payment webhooks. Test your full submit-and-pay flow before using this in production.
- **Job retries.** Async validation state is not persisted on the submission. If a spam validation job fails and retries after partially completing, non-idempotent integrations could theoretically run more than once. A future improvement would persist a “validated” or “post-processed” flag on the submission.

A unified pipeline for all outbound side effects would reduce the above edge cases but requires a larger refactor. This integration scopes the hold behavior to Freeform’s built-in paths behind a per-form toggle (enabled by default).
