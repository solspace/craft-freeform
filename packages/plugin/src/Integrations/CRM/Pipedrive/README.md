# Setup Guide

This guide assumes you have a [Pipedrive](http://pipedrive.com) account already.

## Compatibility

Uses OAuth flow on `v1` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Leads**
- **Deals**
- **Persons**
- **Organizations**
- **Notes**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**

## Duplicate Check & Update

- Duplicate detection on **Persons** email address (and updating contact info if matches).

## Setup Instructions

### 1. Prepare your site's end for Integration

- Copy the URL in the **OAuth 2.0 Return URI** field to your clipboard.
- Leave this page open.

### 2. Create & get API Key from Pipedrive

- Open a new tab and visit the [Pipedrive Developer Hub](https://developers.pipedrive.com/) site.
    - If you don't already have a developer account, create one here. Otherwise, login.
- Click on the **Create an App** button at the top right and choose _Create Private App_.
- In the _Basic Info_ page, enter a unique app name and paste the Freeform OAuth URL in the **Callback URL** field. Click Save.
- In the _OAuth & Access Scopes_ page, enable the following:
    - **Deals**
        - **Full Access**
    - **Contacts**
        - **Full Access**
    - **Leads**
        - **Full Access**
    - **Search for all data**
    - The **Installation URL** field can be left blank.
- Copy the value in the **Client ID** setting.
- Copy the value in the **Client Secret** setting.
- Save the new app.

### 3. Install the App on Production Pipedrive Account

<span class="note tip" style="margin-bottom: 10px;"><b>Note:</b> If you wish to work with your app in Sandbox/Dev mode, you can skip this step for now.</span><span class="note warning"><b>Important:</b> In order for this to work, the site (and its callback URL) you are connecting the integration to will need to be publicly accessible.</span>

- Inside of the [Pipedrive Developer Hub](https://developers.pipedrive.com/) site, click on your newly created app and click the **Change to Live** button at the top right corner.
- Visit your [regular Pipedrive account](https://pipedrive.com).
- In the **Marketplace** area, install your new app.

### 4. Prepare the Connection

- Switch back to this integration tab.
- Enter Pipedrive credentials in the next 2 fields:
    - Paste the Pipedrive **Client ID** value into the **Client ID** field in Freeform.
    - Paste the Pipedrive **Client Secret** value into the **Client Secret** field in Freeform.

### 5. Additional Configuration

- **LEADS**
    - **User ID** (optional) - specify which user ID the leads go into.

<span class="note tip"><b>Note:</b> There seems to be no visual way in Pipedrive to see what the ID's are, so you'll likely need to do something like right-clicking on a User name link to view the ID in a URL.</span>

- **DEALS**
    - **User ID** (optional) - specify which user ID the leads go into.
    - **Stage ID** (optional) - specify which stage ID the leads go into.

<div class="note bold tip">
<p><b>Note:</b> There seems to be no visual way in Pipedrive to see what the ID's are, so you'll likely need to do something like right-clicking on a Stage name / User name link to view the ID in a URL. So for example, to get the Stage ID, go to the <b>Settings</b> area and click on <b>Pipelines</b>. Right-click on a stage name and copy the link. You'll get something like (where <code>3</code> is the stage ID in this case): <code>https://yourcompany.pipedrive.com/stages/edit/3.json</code></p>
<p>The stage ID is unique, so Pipedrive will automatically know which pipeline you're referring to when you specify the stage ID.</p>
</div>

### 6. Finish & Verify the Integration

- Click the **Save** button.
- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- A popup will load a Pipedrive OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow & Install** when asked for permissions.
- If successful, the _Unauthorized_ flag should now appear green with _Authorized_ at the top.

### 7. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Pipedrive** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Pipedrive fields as needed.

<span class="note warning"><b>Important:</b> Please note that if you set this up initially on a development environment, you will need to update your callback URL and reauthorize the connection on your production environment. However, your settings and field mappings will remain intact.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>