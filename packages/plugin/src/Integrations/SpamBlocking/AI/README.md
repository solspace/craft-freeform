# AI Spam Protection

AI-based spam detection for Freeform submissions. This integration sends selected field values to a configured AI integration (e.g., OpenAI or Gemini) and flags the submission as spam when the AI response indicates spam.

## Settings
- AI Integration (per-form, required)
- Fields to Analyze (per-form)
- System Prompt (per-form, optional)
- Include Field Labels (per-form)
- Display Errors (per-form option)

**Note**: 
- This integration appears in every form's integration tab but must be manually enabled per form
- AI parameters (model, max tokens, temperature) are configured in the AI integration settings, not here

## Behavior
Runs during form validation. The AI analyzes submission content and provides an assessment of whether it appears to be spam.

**Flexible Response Detection:**
- Looks for spam indicators like "spam", "suspicious", "promotional", etc.
- Recognizes confidence levels if provided (DEFINITELY_SPAM, LIKELY_SPAM, etc.)
- Falls back to general spam detection for any response format
- Only blocks when clear spam indicators are present

## Example: Spam submission (form fill-up)

Form fields (with "Include Field Labels" enabled):
```
Name: Great Deals Ltd
Email: promos@deals.example
Message: Buy now! Limited time offer. Visit http://spammysite.example for 90% OFF!!
Phone: +1 555 000 1111
```

Result in Spam Reasons (admin):
```
AI: Repetitive promotional language with external link [Definitely spam, 9/10]
```

## System prompt example for users

You can leave this empty to use the default. To customize the analysis, a good starting prompt is:

```
Analyze the following form submission and decide if it is spam. Consider factors like promotional or sales language, excessive links, irrelevant content, suspicious patterns, profanity, or automation signals.
```
