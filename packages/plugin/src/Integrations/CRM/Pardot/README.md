# Setup Guide

This guide assumes you have a [Pardot](https://www.pardot.com) account already.

## Compatibility

Uses OAuth flow on `v4` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Prospect**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**
    - There may be some limitations on types of fields that can be mapped.

## Setup Instructions

### 1. Prepare Freeform's end for Integration

- Select *Pardot (v5)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration. e.g. `My Pardot Integration`
- Copy the URL value generated in the **OAuth 2.0 Return URI** field, e.g. `https://mysite.net/admin/freeform/oauth/authorize`.
- Leave this page open and open a new tab to go to the Salesforce site...

### 2. Prepare Pardot/Salesforce's end for Integration

- Open another browser tab and go to [Salesforce website](https://login.salesforce.com) and log into your account.
- On the left navigation menu, click on **Apps**, then click **App Manager**.
- At the top right corner of the page, click the **New Connected App** button.
- Fill out the fields in the **Basic Information** section.
- In the **API (Enable OAuth Settings)** section, click the **Enable OAuth Settings** checkbox.
- More fields will appear. In the **Callback URL** field, paste the value you copied from the **OAuth 2.0 Return URI** field inside Freeform.
- In the **Selected OAuth Scopes** field, select the following permissions from the list and click **Add** arrow button:
    - **Perform requests on your behalf at any time (refresh_token, offline_access)**
    - **Access Pardot services**
- You shouldn't need to fill out any further fields, and then click **Save** button.
- You will be taken to a new page that lists info about your newly created app, including **Consumer Key** and **Consumer Secret** values. You will need to copy each of these values.
    - Salesforce gets tricky to navigate, so do yourself a favor and copy and paste these 2 values into a text editor for now, being sure to label each too. You'll save yourself some extra steps later on.
- At the top middle of the page, click on the **Manage** button.
- At the top middle of the next page, click the **Edit Policies** button.
- Under the **OAuth policies** section, adjust the following settings:
    - In the **Permitted Users** field, be sure that it is set to **All users may self-authorize**.
    - In the **IP Relaxation** field, change the setting to **Relaxed IP restrictions**.
    - Click **Save** button at bottom of page.
- If you copy and pasted the **Consumer Key** and **Consumer Secret** values in a text editor, you can skip these next couple steps:
    - To go back to your app to see these values, click on the **App Manager** navigation item (under **Apps**)
    - Find your app in the list. Then in the right column, click the down arrow, and then click **View**.

### 3. Prepare the Connection

- Flip back to the Freeform CP browser tab.
- Enter Salesforce credentials in the next 2 fields:
    - Paste the Salesforce **Consumer Key** value into the **Client ID** field in Freeform.
    - Paste the Salesforce **Consumer Secret** value into the **Client Secret** field in Freeform.
- Enter your Pardot Business ID into the **Pardot Business Unit ID** field.
    - To find the Pardot Business Unit ID, go to *Marketing Setup*, in the *Quick Find* box, enter `Pardot`, and then select *Pardot Account Setup*. Copy the business unit ID for the Pardot instance you want to use.

### 4. Finish the Integration

- Click the **Save** button.
- You will be redirected to a Salesforce OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow** when asked for permissions.
- You will then be redirected back to the **Freeform CRM Integration** page.

### 5. Verify Authorization

- After the integration is saved, it'll return you to the list of CRM integrations.
- Click into the newly created integration.
- Confirm that there is green circle with **Authorized** in the middle of the page.

### 6. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Pardot** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Pardot fields as needed.

<span class="note warning"><b>Important:</b> Please note that if you set this up initially on a development environment, you will need to update your callback URL and reauthorize the connection on your production environment. However, your settings and field mappings will remain intact.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>

<style type="text/css">.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}</style>