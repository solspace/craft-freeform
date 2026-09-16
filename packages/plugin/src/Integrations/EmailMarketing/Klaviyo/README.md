# Setup Guide

This integration requires Freeform Pro and a [Klaviyo](https://www.klaviyo.com) account. It uses Klaviyo's REST API, revision `2026-07-15`.

## Supported Features

- Subscribe email addresses to a selected Klaviyo list.
- Create profiles or update existing profiles using the submitted email address.
- Map profile fields, including names, phone numbers, company details, and location.
- Map custom profile properties by name. Custom values are sent as text; multiple selected options are joined with commas.
- Use an optional opt-in checkbox and Freeform integration rules.

## Setup Instructions

### 1. Create a Private API Key

Create a private API key in your [Klaviyo API key settings](https://www.klaviyo.com/settings/account/api-keys) with these scopes:

- **List**: Full Access
- **Profiles**: Full Access
- **Subscriptions**: Full Access

A public API key (site ID) cannot be used for this integration.

### 2. Configure the Integration

- In Freeform, create a new **Klaviyo** email marketing integration.
- Enter the key in **Private API Key**, or reference an environment variable containing the key.
- If you want to map custom properties, enter their exact names in **Custom Profile Properties**, one per line. For example:

  ```text
  Favorite Color
  Membership Level
  Referral Source
  ```

  Names are case-sensitive. These properties are account-wide and can be created when a profile is sent to Klaviyo. They do not need to exist on a profile beforehand.

- Save the integration and click **Authorize**. This checks that the key can read lists; the write scopes above are also required for submissions.

### 3. Configure Each Form

- Open the form builder and select **Integrations → Klaviyo**.
- Enable the integration, choose the **Target Email Field**, and select a mailing list.
- If subscribing is optional, select the **Opt-in Field**. An unchecked or missing opt-in field skips both the profile update and subscription. Without an opt-in field, every submission that passes the integration rules is sent to Klaviyo.
- Map **Profile Fields** and **Custom Profile Properties** as needed.
- Save the form.

After changing custom property names in the integration settings, refresh the fields in the form builder to update the available mappings. Use Klaviyo's exact property names; do not prefix custom names with `properties.`.

Phone numbers must use E.164 format, such as `+12045550123`. Timezones should use IANA identifiers, such as `America/Winnipeg`. Map these values only when they are available in the required format.

## Subscription Behavior

Freeform creates or updates the profile first, then requests an email subscription to the chosen list. Profile updates do not change consent by themselves. Klaviyo processes the subscription request asynchronously, so accepting the request does not mean the subscription is already complete.

The list's opt-in setting controls confirmation. For a double opt-in list, the subscriber must confirm the email before becoming subscribed. Freeform does not bypass this setting.

Klaviyo's subscription endpoint can resubscribe previously unsubscribed or manually suppressed profiles. Use the integration for forms that collect permission to subscribe, and configure the opt-in checkbox for forms with an optional newsletter signup.

Unmapped fields and blank mapped values are left unchanged. SMS subscriptions, events, and ecommerce data are not included in this integration.

If the profile update succeeds but the subscription request fails, the profile changes remain in Klaviyo. Check Freeform's integration logs for the failed request. Confirm new profiles, existing profiles, custom properties, an unchecked opt-in, and double opt-in behavior with a test list before enabling the integration on a live form.

## API References

- [Create or Update Profile](https://developers.klaviyo.com/en/reference/create_or_update_profile)
- [Bulk Subscribe Profiles](https://developers.klaviyo.com/en/reference/bulk_subscribe_profiles)
- [Get Lists](https://developers.klaviyo.com/en/reference/get_lists)

---

<small>Do you need more from this integration? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build additional features.</small>
