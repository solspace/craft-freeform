# Setup Guide

This guide assumes you have an [ActiveCampaign](https://www.activecampaign.com) account already.

## Compatibility

Uses `v3` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Contact**
- **Contact Tags**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**

## Duplicate Check & Update

- Duplicate check on **Contact** email address (will update other details if it matches instead of creating a new contact).

## Setup Instructions

### 1. Create & get API Key from ActiveCampaign

- Go to the [ActiveCampaign website](https://www.activecampaign.com) and log into your account.
- At the bottom left corner, click on the Settings nav menu option / gear icon (above the profile icon).
- On the next page, click the **Developer** subnav option near the middle of the page.
- Copy the values in the **API URL** and **API Key** fields.

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *ActiveCampaign (v3)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Paste the **API URL** value from ActiveCampaign into the **API URL** field in Freeform.
- Paste the **API Key** value from ActiveCampaign into the **API Key** field in Freeform.

### 3. Verify Authorization

- After the integration is saved, it'll return you to the list of Email Marketing integrations.
- Click into the newly created integration.
- Confirm that there is green circle with **Authorized** in the middle of the page.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **ActiveCampaign** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Choose a Freeform field to be the target opt-in field.
    - Select a mailing list that new users should be subscribed to.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the ActiveCampaign fields as needed.

## Notes

When mapping to **Contact Tags**, you can use any type of Freeform field you like, allowing for the most flexibility for all workflows. If you wish to have the user select their own tags, Freeform will automatically map over option value(s) from option fields such as checkboxes, dropdown fields, etc. If you wish to have tags forced upon submitters, you can include a Hidden or Invisible field type and include tag(s) in the value in the form builder.

When specifying multiples, separate each with a semi-colon (`;`), e.g. `basic;premium;premium plus;preferred`.