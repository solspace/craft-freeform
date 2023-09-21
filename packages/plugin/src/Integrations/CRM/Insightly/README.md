# Setup Guide

This guide assumes you have an [Insightly](https://www.insightly.com/) account already.

## Compatibility

Uses `v3.1` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Leads**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**

## Setup Instructions

### 1. Create & get API Key from Insightly

- Go to [Insightly](https://www.insightly.com/) and log into your account.
- At the top right corner, click on the profile icon and select **User Settings**.
- On the next page, towards the bottom under the **API Key** section, copy the token that is there.

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *Insightly (v3.1)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Paste the Insightly API token into the **API Key** field in Freeform.
- Click the **Save** button.

### 3. Verify Authorization

- After the integration is saved, it'll return you to the list of CRM integrations.
- Click into the newly created integration.
- Confirm that there is green circle with **Authorized** in the middle of the page.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Insightly** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Insightly fields as needed.