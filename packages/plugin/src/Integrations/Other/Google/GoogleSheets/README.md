# Setup Guide

This guide assumes you have a [Google Workspace](https://workspace.google.com) account already.

<span class="note warning"><b>Important:</b> In order for this to work, the site you are connecting the integration to will need to use a valid TLD.</span>

## Compatibility

Uses OAuth flow on `v4` of the REST API.

### Endpoints
Maps data to spreadsheets via the **Google Sheets API**.

### Fields
Maps Freeform submission data as new rows in a Google Sheets spreadsheet.

## Setup Instructions

### 1. Prepare your site's end for Integration

- Select *Google Sheets (v4)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Copy the URL in the **OAuth 2.0 Return URI** field to your clipboard.
- Leave this page open.

### 2. Set up Google Account for Integration

- Open up a new browser tab and go to the [Google API Console](https://console.cloud.google.com/apis/dashboard/) and log into your account.
- On the **Enabled APIs & Services** page, click on the _Enable APIs & Services_ button.
    - Search for or find `Google Sheets API` and click on it.
    - Click on the _Enable_ button to enable it.
    - Once enabled, click on the _Create Credentials_ button at the top right of the page.
        - For **Which API are you using?**, select _Google Sheets API_.
        - For **What data will you be accessing?**, select _User data_
        - Click _Next_ button.
- Under the **Scopes** section, click on the _Add or Remove Scopes_ button.
    - Find `auth/spreadsheets` in the list, or manually add it... 
        - To manually add, enter `https://www.googleapis.com/auth/spreadsheets` in **Manually Add Scopes** setting.
        - Click _Save and continue_ button.
- Under the **OAuth Client ID** section, fill out the settings as follows:
    - For **Application type**, select _Web Application_.
    - For **Name**, enter a value, e.g. `Freeform`
    - Under **Authorized redirect URIs**, click on the _Add URI_ button.
    - Paste the value you copied from Freeform's **OAuth 2.0 Return URI** field here
    - Click _Next_ button.
    - You will then be presented with your Client ID. You can ignore this for now.
- Click on the **Credentials** navigation tab.
    - Find your newly created app (e.g. `Freeform`) under the **OAuth 2.0 Client IDs** section and click on it.
    - On the next page, you'll be presented with credential information.
    - Copy the following newly created credentials:
        - **Client ID**
        - **Client Secret**

### 3. Prepare the Connection

- Flip back to the Freeform CP browser tab.
- Paste the Google Sheets **Client ID** value into the **Client ID** field in Freeform.
- Paste the Google Sheets **Client Secret** value into the **Client Secret** field in Freeform.
- Additional settings to set the defaults for forms:
    - **Process User-inputted Formulas and Formats**
        - Any user-inputted values with formula and formatting syntax will be respected and parsed in the spreadsheet. When disabled, these values will be escaped.
    - **Row Insert Behavior**
        - Choose how new data rows should be inserted into the Google Sheet. **Insert New Row** will add a new row to the spreadsheet directly before the first empty row. **Replace Next Empty Row** will find the first empty row and write the new content into it. Neither option will overwrite existing data.

### 4. Finish the Connection

- Click the **Save** button.
- You will be redirected to a Google OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow** when asked for permissions.
- You will then be redirected back to the **Freeform Integration** page.
- Confirm that there is a green circle with **Authorized** in the middle of the page.

### 5. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Google Sheets** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Set the **Google Sheets Spreadsheet ID**, e.g. `4hzvcabRd6yZwux7vK80-NK02zSDD7U-X8MePslAiHvc`
    - Select the **Sheet** to use (optional)
        - Choose the sheet the data should be pushed to. If you leave this field empty, the data will automatically be pushed to the first sheet.
    - Set the **Row Offset** (optional)
        - Enter the number of rows to skip from the beginning of the sheet. Input `0` to start from the first row, or `3` to skip the first 3 rows, and so on.
    - **Process User-inputted Formulas and Formats**
        - Any user-inputted values with formula and formatting syntax will be respected and parsed in the spreadsheet. When disabled, these values will be escaped.
    - **Row Insert Behavior**
        - Choose how new data rows should be inserted into the Google Sheet. **Insert New Row** will add a new row to the spreadsheet directly before the first empty row. **Replace Next Empty Row** will find the first empty row and write the new content into it. Neither option will overwrite existing data.
    - Select the Freeform fields to be mapped to the applicable Google Sheet columns.

<span class="note warning"><b>Important:</b> Please note that if you set this up initially on a development environment, you will need to update your callback URL and reauthorize the connection on your production environment. However, your settings and field mappings will remain intact.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>

<style type="text/css">ol{list-style-type:upper-alpha;padding-left:20px!important}ol>li{font-weight:600}ol>li>ul>li{font-weight:400}.warning {display:block;padding:10px 15px;border:1px solid var(--warning-color);border-radius:5px;}</style>