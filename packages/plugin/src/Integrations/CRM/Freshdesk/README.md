# Setup Guide

This guide assumes you have a [Freshdesk](https://www.freshworks.com/freshdesk/) account already.

## Compatibility

Uses `v2` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Tickets**

### Fields
Maps data to the following field types:

- **Standard**
- Most **Custom** fields

## Duplicate Check & Update

- Duplicate detection will automatically be applied to the email address and a **Contact** will be created or updated automatically by Freshdesk.

## Setup Instructions

### 1. Create & get API Key from Freshdesk

- Go to your [Freshdesk](https://freshdesk.com) account (e.g. `https://yourcompany.freshdesk.com`) and login.
- At the top right corner, click on the profile icon and select **Profile Settings**.
- On the next page, toward the top right side you'll see an input labelled **Your API Key**.
- Copy that API key to your clipboard.

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *Freshdesk (v2)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Paste the API Key from Freshdesk into the **API Key** field in Freeform.
- In the **Domain** field, enter your Freshdesk helpdesk domain, e.g. `https://yourcompany.freshdesk.com`.

### 3. Additional Configuration

- Complete the rest of the following optional fields:
    - **Default Type** - set the default **Type** for tickets, e.g. `Question`.
    - **Default Priority** - set the default **Priority** for tickets, e.g. `1` (low).
    - **Default Status** - set the default **Status** for tickets, e.g. `2` (open).
    - **Default Source** - set the default **Source** for tickets, e.g. `1` (email), `2` (portal), etc.
- Click the **Save** button.

### 4. Verify Authorization

- After the integration is saved, it'll return you to the list of CRM integrations.
- Click into the newly created integration.
- Confirm that there is green circle with **Authorized** in the middle of the page.

### 5. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Freshdesk** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Freshdesk fields as needed.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>