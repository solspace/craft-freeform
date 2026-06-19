# Setup Guide

This guide assumes you have an [Brevo](https://brevo.com) account already.

## Compatibility

Uses API Key on `v3` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Contacts**

### Fields
Maps data to the following field types:

- **Contact Attributes**

## Duplicate Check & Update

- Duplicate check on **Contact** email address (will update other details if it matches instead of creating a new contact).

## Setup Instructions

### 1. Create & get API Key from Brevo

- Go to the [Brevo website](https://www.brevo.com) and log into your account.
- At the top right corner, click on the gear icon.
- On the next page, click the **SMTP & API** subnav option near the middle of the page.
- Click the **API Keys & MCP** tab and then **Generate API key** button.
- Fil in the **Key name** field, select an **Expiry** option and click **Generate**.
- Copy the value in the **API key** field.

### 2. Set up Integration on your site

- Switch back to this integration tab.
- Paste the **API Key** value from Brevo into the **API Key** field in Freeform.
- Click the **Save** button.

### 3. Verify Authorization

- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- If successful, the _Unauthorized_ flag should now appear green with _Authorized_ at the top.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Brevo** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Choose a Freeform field to be the target opt-in field.
    - Select a mailing list that new users should be subscribed to.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Brevo fields as needed.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>
