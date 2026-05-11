# Setup Guide

This guide assumes you have a [Salesforce](http://salesforce.com) account already.

<span class="note warning"><b>Important:</b> This integration will not work with the _Salesforce **Essentials**_ plan as it does not have access to the API.</span>

## Compatibility

Uses OAuth flow with Salesforce's **External Client App** (required in 2026) on `v58` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Leads**
- **Opportunity**
- **Account**
- **Contact**
- **Files** (see below)

### Fields
Maps data to the following field types:

- **Text** fields: String, Encrypted String, Textarea, Email, URL, Address, Picklist, Multipicklist, Date/Time fields
- **Numeric** fields: Number, Phone, Currency
- **Other** fields: Reference/relationship
- **Files**: map uploaded files to Salesforce and relate them to **Leads**, **Opportunities**, **Accounts**, and **Contacts** .
- There are some limitations to types of fields that can be mapped, such as **Lookup** fields.

## Duplicate Check & Update

The following duplicate logic applies to the **Opportunity**/**Account**/**Contact** approach (not **Leads**).

### Default Logic

A duplicate check on records is done in the following way:

1. Check whether the *Account* already exists:
    - Check against the **Name** field as the identifier.
        - Freeform will create an *Account* with the **First Name** and **Last Name** mapped to the *Contact* if you leave the *Account* **Name** field empty. This is helpful if you are dealing with customers not necessarily belonging to a company or organization, and just wish to have a Salesforce Account matching the Contact.
    - If no match, create a new *Account*.
2. Check whether the *Contact* already exists:
    - Check against the **Email address** as the identifier.
    - If email address exists in Salesforce *Contact*, update the existing Contact with other details.
    - If no email address match, check if **first name** and **last name** exist in Salesforce *Contact*, then update the existing *Contact* with all other values including the new email address.
    - If no matches at all, create a new Salesforce *Contact*.
    - If *Account* **Name** matched, assign the new Contact to the existing Salesforce Account.
3. Create new *Opportunity*.
    - Attach *Opportunity* to existing or newly created Salesforce *Account*.

### Alternate Logic

An alternate duplicate check on records is also available. When the **Check Contact email address and Account website when checking for Duplicates** setting is enabled, the following logic will happen instead:

1. Check whether the *Contact* already exists:
    - Check against **Email address** as the identifier.
    - If there's a match, update the *Contact* with new values, where supplied.
    - If no match, create a new *Contact*.
2. Check whether the *Account* already exists:
    - Check against the **Website** field domain. If you are not mapping a domain to the **Website** field, Freeform will automatically sniff the *Contact* email address, take the domain from it and pass it off to the Salesforce *Account* as the **Website** field value.
    - If there's a match, update the *Account* with new values, where supplied.
    - If no match, create a new Salesforce *Account*.
    - If a new *Contact* was created, link the contact to the *Account*.
3. Create new *Opportunity*.
    - Attach *Opportunity* to existing or newly created Salesforce *Account*.

## Setup Instructions

### 1. Prepare Freeform's end for Integration

- Copy the URL value generated in the **OAuth 2.0 Return URI** field, e.g. `https://mysite.net/admin/freeform/oauth/authorize`.
- Leave this page open and open a new tab to go to the Salesforce site...

### 2. Prepare Salesforce's end for Integration

- Open another browser tab and go to [Salesforce website](https://login.salesforce.com) and log into your account.
- On the left navigation menu, click on **Apps**, then click **External Client Apps** → **External Client App Manager**.
- At the top right corner of the page, click the **New External Client App** button.
- Fill out the fields in the **Basic Information** section.
- In the **API (Enable OAuth Settings)** section, click the **Enable OAuth Settings** checkbox. More fields will appear...
  - In the **App Settings** area:
    - In the **Callback URL** field, paste the value from the **OAuth 2.0 Return URI** field in Freeform's settings for the integration.
    - In the **Selected OAuth Scopes** field, select the following permissions from the list and click **Add** arrow button:
        - _Manage user data via APIs (api)_
        - _Perform requests on your behalf at any time (refresh_token, offline_access)_
  - In the **Flow Enablement** area:
    - Check _Enable Client Credentials Flow_
  - In the **Security** area:
    - Check _Require secret for Web Server Flow_
    - Check _Require secret for Refresh Token Flow_
    - Check _Require Proof Key for Code Exchange (PKCE) extension for Supported Authorization Flows_
    - Check _Enable Refresh Token Rotation_
  - You shouldn't need to fill out any further fields, and then click the **Create** button.
- You will be taken to a new page that lists info about your newly created app.
- To get your **Consumer Key** and **Consumer Secret** values, follow the steps below:
  - Click on the **Settings** tab.
  - Click on **OAuth Settings**.
  - Click the **Consumer Key and Secret** button.
    - On the page that loads, copy the **Consumer Key** and **Consumer Secret** values.

### 3. Continue the Integration on your site

- Switch back to this integration tab.
- Paste the Salesforce **Consumer Key** value into the **Client ID** field in Freeform.
- Paste the Salesforce **Consumer Secret** value into the **Client Secret** field in Freeform.
- Click the **Save** button.

### 4. Finish & Verify the Integration

- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- A popup will load a Salesforce OAuth page to allow permissions.
    - If not currently logged in, fill in your credentials.
    - Click **Allow** when asked for permissions.
- If successful, the _Unauthorized_ flag should now appear green with _Authorized_ at the top.

### 5. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Salesforce** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Select the API endpoints you wish to map to.
    - Map Freeform fields to the Salesforce fields as needed.

### 6. Additional Configuration

- **LEADS**
    - **Assign Lead Owner?** - Enabling this will make Salesforce assign a lead owner based on lead owner assignment rules in Salesforce.
    - **Sandbox Mode** - Enable this if your Salesforce account is in Sandbox mode.
    - **Using custom URL?** - Enable this if you connect to your Salesforce account with a custom company URL such as `mycompany.my.salesforce.com`.
- **OPPORTUNITY**
    - **Close Date** - Enter a relative textual date string for the Close Date of the newly created Opportunity (e.g. `7 days`).
    - **Stage Name** - Enter the Stage Name the newly created Opportunity should be assigned to (e.g. `Prospecting`).
    - **Sandbox Mode** - Enable this if your Salesforce account is in Sandbox mode.
    - **Append checkboxes field values on Contact update?** - If a Contact already exists in Salesforce, enabling this will append additional checkboxes field values to the Contact inside Salesforce, instead of overwriting the options.
    - **Append checkboxes field values on Account update?** - If an Account already exists in Salesforce, enabling this will append additional checkboxes field values to the Account inside Salesforce, instead of overwriting the options.
    - **Check Contact email address and Account website when checking for Duplicates** - By default, Freeform checks the Contact's first name, last name, email address, and Account name. If enabled, it will check only the Contact's email address and the Account's website. If no website is provided, Freeform will use the domain from the Contact's email address.

<span class="note warning"><b>Important:</b> Please note that if you set this up initially on a development environment, you will need to update your callback URL and reauthorize the connection on your production environment. However, your settings and field mappings will remain intact.</span>

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/custom-development/) to build any feature or change you need.</small>