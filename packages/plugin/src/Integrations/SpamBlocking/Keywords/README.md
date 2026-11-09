# Blocked keywords

Check text and textarea fields for blocked words, phrases, and patterns. Keep a shared list here and add extra entries to individual forms.

## Set up the default list

1. Choose whether the integration is **Enabled by default**.
2. Enter one word, phrase, or pattern per line in **Default Blocked Keywords**.
3. Save the integration.

<details>
<summary>Words, phrases, and wildcard examples</summary>

```text
spam
"generate new leads"
lead*
*offer*
```

- A word matches at word boundaries.
- Put a phrase in double quotes.
- Use `*` for partial matches. `lead*` can match a word beginning with `lead`, while `*offer*` can match text containing `offer`.

Use wildcards around a character or partial string when you want it matched inside longer text.

</details>

<details>
<summary>Show field errors while troubleshooting</summary>

In **Advanced settings**, enable **Show Field Errors** to display a message beside fields containing blocked values. This is usually left off.

Enable it to edit **Error Message**. You can use `{value}` for the submitted value and `{keyword}` for the matching blocked entry.

Opening or closing Advanced settings does not change the field-error setting.

</details>

## Use the list on a form

1. Open the form and select **Integrations**.
2. Enable this integration if it is not already enabled.
3. Add form-specific entries if needed. These are combined with the default list rather than replacing it.
4. Save the form.

Matches mark the submission as spam. Freeform's spam settings determine how the submission is handled.

<details>
<summary>Use the starter list</summary>

Click **Add Starter List** beside the default list to add suggested entries. Existing entries are kept and duplicates are skipped. Review the entries and remove any you do not need before saving. **Undo** restores the previous list until you edit it manually.

The starter list contains 100 English words, phrases, and wildcard patterns covering SEO pitches, investment offers, pharmaceuticals, adult content, gambling, and other promotional messages. Some entries can also appear in legitimate submissions. Remove any that do not suit your site. For example, a pharmacy or financial services site may need to remove several of these rules.

</details>
