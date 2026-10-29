# Blocked email addresses

Block values submitted through Email fields. Keep a shared list here and add extra addresses or patterns to individual forms.

## Set up the default list

1. Choose whether the integration is **Enabled by default**.
2. Enter one address or pattern per line in **Default Blocked Email Addresses**.
3. Save the integration.

<details>
<summary>Address and wildcard examples</summary>

```text
person@example.com
*@example.com
*@*.ru
```

Patterns match the whole email address. Use `*` to match a variable part. For example, `*@example.com` matches that domain, while `*@*.ru` matches domains ending in `.ru`, including subdomains. It does not match `example.ru.com`.

Start with a small list and check that it matches the addresses you intend to block. Domain-ending rules filter the email address, not the visitor's location.

</details>

<details>
<summary>Domain checks and field errors</summary>

These options are in **Advanced settings**. Opening or closing the panel does not change them.

**Check Email Domains** marks a submission as spam if an email domain has neither an MX record nor an A record. This checks the domain, not whether the individual mailbox exists.

**Show Field Errors** adds a message beside Email fields containing blocked values. It is usually left off and can be useful when troubleshooting. Enable it to edit **Error Message**, which supports `{email}` for the submitted address.

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

The list includes disposable email domains and broader rules for `.ru`, `.su`, `.xyz`, and `.top`. These are optional examples, not a list of confirmed spam sources. Domain-ending rules block every address using those endings, including legitimate contacts.

</details>
