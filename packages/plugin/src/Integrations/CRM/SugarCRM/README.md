# Setup Guide

This guide assumes you have a [SugarAI](https://sugarai.com) (formerly SugarCRM) account already.

## Compatibility

Uses `v1.2` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Contacts**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**

## Setup Instructions

### 1. Create & get API Key from SugarAI

- Open a new tab and visit [SugarAI](https://account.sugarai.com/) and log into your account.
- At the top right corner, click on the profile icon and select **Settings**.
- On the next page, on the left side Settings panel, under **SugarAI API**, click the **API Settings** link.
- You'll then see your keys for SugarAI API under Account ID and Secret Key. Click the **Generate New API Keys** button if you wish to generate new ones (optional).
- Copy the Account ID and Secret Key.

### 2. Set up Integration on your site

- Switch back to this integration tab.
- Paste the SugarAI **Account ID** and **Secret Key** into the **Account ID** and **Secret Key** field, respectively, in Freeform.
- Click the **Save** button.

### 3. Authorize the Integration

- After the integration is saved, you will see an **Authorize** button appear.
- Click the **Authorize** button.
- If authorized successfully, you'll see a green _Authorized_ status at the top beside the integration name.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **SugarAI** in the list of available integrations.
- On the right side of the page:
  - Enable the integration.
  - Select the API endpoints you wish to map to.
  - Map Freeform fields to the SugarAI fields as needed.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>

