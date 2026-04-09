# Setup Guide

This guide assumes you have a [Zoho CRM](https://www.zoho.com/crm/) account already.

## Compatibility

Uses OAuth flow on `v2` of the REST API.

### Endpoints
Maps data to the following modules:

- **Leads**
- **Deals**
- **Contacts**
- **Accounts**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**

## Setup Instructions

### 1. Prepare Freeform's end for Integration

- Leave this page open and open a new tab to go to the Zoho site...

### 2. Prepare Zoho's end for Integration

- Go to the Zoho *Developer Console* website ([accounts.zoho.com/developerconsole](https://accounts.zoho.com/developerconsole)).
- Click the **Add Client** button to begin:
  - Choose the **Server-based Applications** card
    - For **Client Name**, enter whatever you like, e.g. `My Website`.
    - For **Homepage URL**, enter the URL of the website you're using this one, e.g. `https://my-precio.us`.
    - For **Authorized Redirect URIs**, enter the automatically generated **OAuth 2.0 Return URI** from the **Freeform CRM Integration** page. e.g. `https://my-precio.us/admin/freeform/settings/crm/myZohoIntegration`
    - Then click **Create** to save the new Client ID.
- On the next page, take note and copy the *Client ID* and *Client Secret* tokens.

### 3. Continue the Integration on your site

- Switch back to this integration tab.
- Paste the Zoho **Client ID** value into the **Client ID** field in Freeform.
- Paste the Salesforce **Client Secret** value into the **Client Secret** field in Freeform.
- Click the **Save** button.

### 4. Finish & Verify the Integration

- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- A popup will load a Zoho OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow** when asked for permissions.
- If successful, the _Unauthorized_ flag should now appear green with _Authorized_ at the top.

### 5. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Zoho** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Zoho CRM fields as needed.

<span class="note warning"><b>Important:</b> Please note that if you set this up initially on a development environment, you will need to update your callback URL and reauthorize the connection on your production environment. However, your settings and field mappings will remain intact.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>