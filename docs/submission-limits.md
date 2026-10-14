# Submission Limits (Freeform 5.17 Lite and Pro)

Configure new forms under **Settings → Behavior → Limits**. Enable **Limit Submissions**, enter **Number of Submissions**, choose **Limit Period**, and set the **Limit Reached Message**. This is the recommended approach; template configuration remains supported for dynamic limits.

- **Total** counts all stored, non-spam, non-deleted submissions for this form and never resets.
- **Per day/week/month/year** counts the current calendar period in Craft's configured timezone. Weeks begin on Craft's configured first day of the week. The end boundary is exclusive; daylight-saving changes are respected.
- Keep **Store Submitted Data** enabled. When storage requires opt-in, visitors must opt in. Editing an existing stored submission does not consume a new slot.
- The limit is checked on the server for normal, AJAX, headless, GraphQL, and programmatic submissions. A per-form mutex and a fresh primary-database count protect the last slot from concurrent requests.
- `form.render()` replaces a full builder-configured form with its message. Messages are plain text; line breaks are retained. An empty message hides the form. Successful submissions still receive their normal success response. Cached forms and custom/manual markup remain protected at submit time.
- Spam and deleted submissions do not consume capacity. Removing or marking a submission as spam can free a slot; restoring it or marking it as valid can fill the quota again.
- No new database table or column is required for this feature.

## Template overrides

Existing `submissionLimit` render properties continue to override the builder. An explicit numeric override retains the old **all-time** behavior unless you also supply `submissionLimitPeriod` (`total`, `day`, `week`, `month`, or `year`). Use `submissionLimitMessage` to override the message and `submissionLimit: null` to turn off a builder quota for a trusted template context. Zero closes the form to new submissions; it does not mean unlimited.

```twig
{% set form = freeform.form('myForm', {
    submissionLimit: entry.registrationCapacity,
    submissionLimitPeriod: 'day',
    submissionLimitMessage: 'Today’s registration limit has been reached.',
}) %}

{{ form.render() }}
```

Overrides travel with Freeform's existing signed/encrypted form context. They must be supplied by your template or trusted server code, not by arbitrary posted fields.

## Custom rendering

`form.isAvailable` combines builder quota and schedule availability. `form.submissionLimitReached` checks the effective quota, including template-only quotas. `form.submissionLimitCount` returns the current period's count. `form.submissionLimitMessage` returns the translated/configured message. Set overrides when loading the form (or call `form.registerContext(overrides)`) before checking these properties.

```twig
{% set form = freeform.form('myForm') %}
{% if form.submissionLimitReached %}
    <p class="alert">{{ form.submissionLimitMessage }}</p>
{% else %}
    {{ form.render() }}
{% endif %}
```

## Existing templates remain valid

`freeform.submissionCount(form)` still returns the all-time count. The original template-only approach below continues to work without builder settings. Its explicit conditional controls display; its `submissionLimit` property still enforces the limit when submitting.

```twig
{% set form = freeform.form('myForm') %}
{% set submissionLimit = 50 %}

{% if freeform.submissionCount(form) >= submissionLimit %}
    <p class="alert">Submission Limit Reached!</p>
{% else %}
    <p class="notice">
        This form has a limit of {{ submissionLimit }} submissions.
        There are currently {{ freeform.submissionCount(form) }} submissions for this form.
    </p>
    {{ form.render({ submissionLimit: submissionLimit }) }}
{% endif %}
```

Total quotas depend on stored rows, so purging submission data also frees capacity. Deferred spam analysis initially counts stored submissions as valid until they are classified as spam. Scheduled availability and duplicate checking apply independently; reaching either restriction does not override the others.
