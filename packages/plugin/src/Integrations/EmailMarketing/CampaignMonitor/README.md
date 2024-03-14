# Setup Guide

This guide assumes you have a [Campaign Monitor](https://www.campaignmonitor.com) account already.

## Compatibility

Uses API tokens on `v3.3` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Subscribers**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**
    - Text
    - Number
    - Multiple Options (can only select one)
    - Multiple Options (can select many)
    - Date

## Setup Instructions

### 1. Create & get API Key from Campaign Monitor

- Go to the [Campaign Monitor website](https://campaignmonitor.com) and log into your account.
- At the top right corner, click on the profile icon and select **Account Settings**.
- On the next page, click the **API keys** link near the bottom of the page.
- After the page reloads, click the **Show API Key** link to reveal your API key.
- Leave this page open and open a new tab to go to the Craft control panel...

### 2. Set up Integration on your site

- Enter a name and handle for the integration.
- Copy the value in the **API Key** field from Campaign Monitor and paste it into the **API Key** field in Freeform.
- Copy the value in the **Client ID** field from Campaign Monitor and paste it into the **Client ID** field in Freeform.
- At the top right corner of the Freeform page, click the **Save** button.

### 3. Verify Authorization

- After the integration is saved, it'll return you to the list of Email Marketing integrations.
- Click on the newly created integration.
- Confirm that there is a green circle with **Authorized** in the middle of the page.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Campaign Monitor** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Choose a Freeform field to be the target opt-in field.
    - Select a mailing list that new users should be subscribed to.
    - Map Freeform fields to the Campaign Monitor fields as you wish.
    - Configure as needed.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>

<style type="text/css">ol{list-style-type:upper-alpha;padding-left:20px!important}ol>li{font-weight:600}ol>li>ul>li{font-weight:400}.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}</style>