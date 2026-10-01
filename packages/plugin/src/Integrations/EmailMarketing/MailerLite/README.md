# Setup Guide

This integration requires Freeform Pro and a [MailerLite](https://www.mailerlite.com) account. It supports the current MailerLite API, not MailerLite Classic.

## Setup Instructions

### 1. Create an API Key

In MailerLite, open **Integrations → MailerLite API** and generate a new token for Freeform. Copy the token before closing the window.

Create any groups and custom subscriber fields you want to use in MailerLite before configuring the form.

### 2. Configure the Integration

- In Freeform, create a **MailerLite** email marketing integration.
- Enter the token in **API Key**, or reference an environment variable containing it.
- Save the integration and click **Authorize** to check the connection.

### 3. Configure Each Form

- Open the form builder and select **Integrations → MailerLite**.
- Enable the integration and choose the **Target Email Field**.
- Select a MailerLite group in the **Mailing List** setting.
- For an optional newsletter signup, select the checkbox in **Opt-in Field**. When that checkbox is unchecked, no data is sent to MailerLite. Without an opt-in field, all submissions allowed by the integration rules are sent.
- Map any **Subscriber Fields** and save the form. Both standard and custom fields are discovered automatically. Refresh the lists/fields in Freeform after adding them in MailerLite.

## Behavior

- Creates or updates the subscriber by email address and adds them to the selected group. Other group memberships remain intact.
- Unmapped fields and blank mapped values are left unchanged. Zero values are preserved.
- Supports text, number, and date fields. Multiple selections mapped to text fields are joined with commas. Number values are passed without removing signs or decimals; use a dot as the decimal separator. Date & Time fields mapped to date fields are formatted as `YYYY-MM-DD`; text or custom mappings must supply that format themselves.
- Double opt-in is controlled in MailerLite under **Account settings → Subscribe settings → Double opt-in for API and integrations**. Enabling it on a MailerLite-hosted form alone does not configure this integration. [MailerLite's double opt-in guide](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers).
- Does not force a subscriber status or request resubscription. Existing unsubscribed, bounced, or junk contacts are not deliberately reactivated. A successful API request does not necessarily mean the contact is an active subscriber.
- API errors use Freeform's integration error handling and logs.

Before enabling the integration on a live form, test a new subscriber, an existing subscriber, an unchecked opt-in, mapped fields, and your MailerLite double opt-in settings with a test group.

## API Reference

- [Authentication and API versioning](https://developers.mailerlite.com/getting-started)
- [Subscriber upserts](https://developers.mailerlite.com/api/subscribers)
- [Groups](https://developers.mailerlite.com/api/groups)
- [Subscriber fields](https://developers.mailerlite.com/api/fields)
