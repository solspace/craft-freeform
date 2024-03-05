# Setup Guide

This guide assumes you have a [Campaign Monitor](https://www.campaignmonitor.com) account already.

## Compatibility

Uses OAuth flow on `v3.3` of the REST API.

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

<span class="note warning"><b>Important:</b> In order for this to work, the site (and its callback URL) you are connecting the integration to will need to be publicly accessible.</span>

### 1. Prepare your site's end for Integration

- Select *Campaign Monitor (v3.3)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Copy the URL in the **OAuth 2.0 Return URI** field to your clipboard.
- Leave this page open.

### 2. Prepare Campaign Monitor's end for Integration

1. Get the Campaign Monitor Client ID
    - Open up a new browser tab and go to the [Campaign Monitor website](https://campaignmonitor.com/) and log into your account.
    - At the top right corner, click on the profile icon and select **Account Settings**.
    - On the next page, click the **API keys** link from the list.
    - Then copy the **Client ID** value.
2. Get the OAuth Client ID and Client Secret
    - Open up a new browser tab and go to the [Campaign Monitor website](https://campaignmonitor.com/) and log into your account.
    - At the top right corner, click on the profile icon and select **Integrations**.
        - If you have multiple client accounts managed together, follow these steps instead:
            - At the top right corner, click on the profile icon and select **Manage Clients**.
            - Select the client account you wish to use, then click on the **Integrations** tab in the navigation.
    - On the next page, scroll to the very bottom and click on the **OAuth Registration** text link.
    - Fill out all of the fields for the app (all are mandatory).
    - Paste the value you copied from Freeform's **OAuth 2.0 Return URI** field into the Campaign Monitor **Redirect URL** field.
    - Click the **Register** button at the bottom to save the app.
    - After the page reloads, click on the **View** link for the newly created app and copy the following credentials:
        - **Client ID**
        - **Client Secret**

### 3. Prepare the Connection

- Flip back to the Freeform CP browser tab.
- Paste the Campaign Monitor account **Client ID** value into the **Campaign Monitor Client ID** field in Freeform.
- Paste the Campaign Monitor OAuth app **Client ID** value into the **Client ID** field in Freeform.
- Paste the Campaign Monitor OAuth app **Client Secret** value into the **Client Secret** field in Freeform.

### 4. Finish the Connection

- Click the **Save** button.
- You will be redirected to a Campaign Monitor OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow** when asked for permissions.
- You will then be redirected back to the **Freeform Email Marketing Integration** page.
- Confirm that there is a green circle with **Authorized** in the middle of the page.

### 5. Configure the Form

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

<span class="note warning"><b>Important:</b> Please note that if you set this up initially on a development environment, you will need to update your callback URL and reauthorize the connection on your production environment. However, your settings and field mappings will remain intact.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>

<style type="text/css">ol{list-style-type:upper-alpha;padding-left:20px!important}ol>li{font-weight:600}ol>li>ul>li{font-weight:400}.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}</style>