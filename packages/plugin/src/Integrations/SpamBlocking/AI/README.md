# AI Spam

AI-based spam analysis for Freeform submissions. This integration sends selected field values to a configured AI integration (e.g. Solspace AI, OpenAI, or Gemini) and flags the submission as spam when the AI response indicates spam.

## Settings
- AI Integration (per-form, required)
- Fields to Analyze (per-form)
- System Prompt (per-form, optional)
- Include Field Labels (per-form)
- Wait for Analysis Before Processing Submission Actions (per-form)
- Display Errors (per-form option)

<span class="note tip">

**NOTE:**
- This integration appears in every form's integration tab but must be manually enabled per form.
- AI parameters (model, max tokens, temperature) are configured in the AI integration settings, not here.
- When the **Wait for Analysis Before Processing Submission Actions** setting is enabled, emails, CRM, webhooks, and other actions should wait for AI. If spam is detected, they are not sent. Leave it off to analyze spam in the background without delaying notifications.

</span>

## Behavior
The AI Spam Analysis runs **after** the submission is stored.

With _Wait for Analysis Before Processing Submission Actions_ enabled:

1. Submission is saved to the database.
2. AI analyzes the selected field content.
3. If **spam** → the submission is marked spam and no email notifications or integrations are run.
4. If **not** spam → email notifications, CRM, webhooks, elements, and other actions are run.

If the _Wait for Analysis Before Processing Submission Actions_ setting is disabled, the AI Spam Analysis will analyze in the background and may mark the submission as spam later. Notifications and integrations may already have run.

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
