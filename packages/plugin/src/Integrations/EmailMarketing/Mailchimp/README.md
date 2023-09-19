# Setup Guide

This guide assumes you have a [Mailchimp](https://mailchimp.com) account already.

## Compatibility

Uses OAuth flow on `v3` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Members** (Contacts)
- **Member Tags** (Contact Tags)
- **Interests** (Contact Groups)

### Fields
Maps data to the following **Standard** and **Custom** field types:

- **Text**
- **Website**
- **URL**
- **Dropdown**
- **Radio**
- **Date**
- **Zip**
- **Contact Tags**
- **Contact Groups**
- **GDPR consent / Marketing settings**

## Duplicate Check & Update

If a duplicate email address is found in _Mailchimp_, the profile data will be updated with the latest information submitted.

## Setup Instructions

### 1. Prepare your site's end for Integration

- Select *Mailchimp (v3)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Copy the URL in the **OAuth 2.0 Return URI** field to your clipboard.
- Leave this page open.

### 2. Prepare Mailchimp's end for Integration

- Open up a new browser tab and go to [Mailchimp website](https://mailchimp.com) and log into your account.
- Click on your account avatar at the top right corner and choose **Account & Billing**.
- On the next page, select the **Extras > Registered Apps** sub navigation option.
- Click the **Register an App** button.
- Fill out all of the fields for the app (all are mandatory except _Upload a logo_).
- On the next page, paste the value you copied from Freeform's **OAuth 2.0 Return URI** field into the Mailchimp **Redirect URI** field.
- Click the **Create** button at the bottom to save the app.
- After the page reloads, scroll down to the bottom of the page and copy the following newly created credentials:
    - **Client ID**
    - **Client Secret**

### 3. Prepare the Connection

- Flip back to the Freeform CP browser tab.
- Paste the Mailchimp **Client ID** value into the **Client ID** field in Freeform.
- Paste the Mailchimp **Client Secret** value into the **Client Secret** field in Freeform.

### 4. Finish the Connection

- Click the **Save** button.
- You will be redirected to a Mailchimp OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow** when asked for permissions.
- You will then be redirected back to the **Freeform Email Marketing Integration** page.
- Confirm that there is a green circle with **Authorized** in the middle of the page.

### 5. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Mailchimp** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Choose a Freeform field to be the target opt-in field.
    - Select a mailing list that new users should be subscribed to.
    - Map Freeform fields to the Mailchimp fields as you wish.
    - Configure *Contact Tags*, *Contact Groups* and *Marketing Permissions* as needed.

## Additional Features

### Contact Tags
To map *Contact Tags*, in the **Contact Tags** field mapping area in the form builder for the form, select a Freeform field that will contain Tag value(s). This could be a select dropdown, checkboxes, radios, hidden field, etc. When specifying multiples, separate by comma.

- By default, the Mailchimp integration will replace/overwrite any existing Contact Tags if it finds an existing contact for the email address in Mailchimp. If you'd like it to append/add to the existing Contact Tags instead, enable the **Append Mailchimp Contact Tags on update instead of overwriting?** setting inside the integration settings.

### Contact Groups
To map a *Contact Interest/Group*, in the **Contact Groups** field mapping area in the form builder for the form, select a Freeform field that will contain an Interest/Group name value(s). This could be a select dropdown, a checkboxes, radios, hidden field, etc.

- Values should be entered exactly as it is in Mailchimp, e.g. `My Group Name`.
- It can accept more than one group.

### Marketing Permissions
To map *GDPR consent / Marketing settings* options, in the **Marketing Permissions** field mapping area in the form builder for the form, select the Freeform field(s) which will represent opting into the corresponding options. ANY value included in these will be considered an opt-in (regardless of whether it's `yes` or `y`, etc). You will need to map a field to each setting individually, so you'll likely need to use a separate checkbox field for each.