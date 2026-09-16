# Microsoft Dynamics 365

Create Leads and Contacts from Freeform submissions using the Microsoft Dataverse Web API. This integration requires Freeform Pro and a Dynamics 365 commercial cloud environment with the applicable tables installed.

## Create the Microsoft connection

An administrator of the customer's Microsoft tenant and Dynamics environment should complete these steps:

1. In **Microsoft Entra ID → App registrations**, create a registration for Freeform. Select **Accounts in this organizational directory only**. This server-to-server connection does not need a redirect URI or interactive user sign-in.
2. Copy the **Application (client) ID** and **Directory (tenant) ID** from the registration overview.
3. Under **Certificates & secrets**, create a client secret. Copy its **Value**, not its ID, before leaving the page. Record the expiry date so the secret can be replaced before it expires.
4. In the **Power Platform admin center**, select the Dynamics environment, then **Settings → Users + permissions → Application users**. Create an application user associated with the app registration and select its business unit.
5. Assign a security role appropriate for the integration. It must allow creation of Leads and/or Contacts and access to the metadata used for field discovery. Additional permissions can be required by secured fields or custom server-side logic. Have the Dynamics administrator configure these permissions; do not assign System Administrator as the permanent integration role.
6. Copy the environment URL, such as `https://yourorg.crm.dynamics.com`. Regional hosts such as `https://yourorg.crm4.dynamics.com` and the corresponding `.api.crm4.dynamics.com` host are supported. Do not include `/api/data/v9.2` or other paths.
7. In **Freeform → Settings → CRM Integrations**, create a **Microsoft Dynamics 365** integration. Enter the environment URL, tenant ID, client ID and client secret value, then save and check the connection.

All four connection settings support environment variables. The client secret is stored using Freeform's encrypted-setting support. Use the same environment host for authentication and API access. Credentials are obtained using OAuth client credentials; no delegated `user_impersonation` permission or refresh token is required for this flow.

Microsoft's [server-to-server setup guide](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-single-tenant-server-server-authentication) and [application user guide](https://learn.microsoft.com/en-us/power-platform/admin/manage-application-users) provide additional setup details. A successful connection check verifies the application identity, not permission to create every record or populate every field.

## Map a form

1. Open the form's Integrations tab and enable the Dynamics integration.
2. Enable **Map to Leads**, **Map to Contacts**, or both.
3. Map the appropriate fields. Supported writable standard and custom fields are loaded automatically from the selected environment. Use **Refresh** after changing Dynamics fields or choices.
4. Include all fields required by the customer's setup. Typical mappings include `firstname`, `lastname`, `emailaddress1`, and the Lead topic (`subject`). Freeform displays the required status reported by Dynamics; custom business logic may impose additional requirements.
5. Configure Freeform's integration rules if records should only be sent for certain submissions, such as when an opt-in checkbox is selected.

The integration creates a new record for each enabled category with a nonempty mapping. If both are enabled, the Lead and Contact are independent records; they are not linked or converted into one another. A category with no mapped values is skipped.

## Field values

| Dynamics field | Supported value |
| --- | --- |
| Text, email, phone, URL, multiline text | Text. Multiple Freeform values are joined with commas. |
| Whole number | An integer, including zero or negative values. |
| Decimal or floating point | A number with a dot as its decimal separator, without currency symbols or thousands separators. |
| Yes/No | A checkbox or `true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off`. An empty value is false. |
| Choice | The underlying numeric option value, not the display label. Options are fetched from Dynamics. |
| Multiple choices | An array of numeric option values, or comma-separated numeric values. |
| Date Only behavior | A Freeform Date & Time field or a `YYYY-MM-DD` value. The calendar date is preserved. |
| User Local date/time behavior | A Freeform Date & Time field or an ISO 8601 timestamp with an offset, such as `2026-09-16T14:30:00-05:00`. |

Use Dynamics option values as the values of corresponding Freeform options. For example, a choice labeled **Website** may have an underlying value of `100000002`; map that number. Blank values are omitted, except Yes/No fields, which send false. Zero and negative numbers are preserved. Dynamics validates field lengths, numeric ranges, permissions, and its own business logic.

Read-only/calculated fields, lookups and relationships, owners, state/status, currency, large integers, files/images, and Time Zone Independent dates are not exposed for mapping in this first version. Custom tables, Accounts, Opportunities, updates to existing records, on-premises Dynamics, Business Central, Finance and Operations, and sovereign clouds are not supported.

## Duplicates and errors

The integration asks Dynamics to apply its configured duplicate-detection rules. If Dynamics reports a duplicate, the integration reports an error; it does not update, merge or silently skip the existing record. Duplicate detection must be enabled with applicable published rules in the customer's environment. Without those rules, repeated submissions can create additional records.

API failures use Freeform's normal integration error handling and logs. A missing field, insufficient permission, invalid choice, expired secret, or custom validation rule can prevent creation. Refresh field mappings after changing the Dynamics schema. Authentication errors include Microsoft's numeric AADSTS code when available, without logging the token request or client secret.

Lead and Contact requests are separate operations. If one succeeds and the other fails, the successful record remains. Timeouts can also occur after Dynamics has created a record. Check Dynamics before retrying or resending a submission, since another attempt can create duplicates. This version does not automatically retry writes or provide exactly-once delivery.

## Customer verification before release

This integration has automated tests with simulated API responses. It still needs validation against a real Dynamics environment and the customer's Craft/Freeform installation. Start in a test environment and verify:

- App registration, application user, connection check, and the assigned security role.
- Separate Lead and Contact submissions, then a form with both enabled.
- Standard fields and a newly added custom field after refreshing the mapping UI.
- Choice and multiple-choice values, true/false checkboxes, zero/negative numbers, Date Only and User Local date/time values.
- Required fields, field security, custom validation, duplicate-detection rules and error reporting.
- Integration conditions and queued submissions, including token acquisition in the queue worker.
- Failed/expired credentials and replacement of the secret.

Share the Dynamics error code and a redacted field mapping if a test fails. Do not include client secrets or access tokens.

## API references

- [Query field metadata](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-metadata-web-api)
- [Create records](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/create-entity-web-api)
- [Multiple-choice values](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/multi-select-picklist)
- [Duplicate detection](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/manage-duplicate-detection-create-update)
