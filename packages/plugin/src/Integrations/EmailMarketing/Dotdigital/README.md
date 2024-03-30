# Setup Guide

This guide assumes you have a [Dotdigital](https://www.dotdigital.com/) account already.

## Compatibility

Uses `v2` of the REST API.

### Endpoints
Maps data to the following endpoints:

- **Contacts**

### Fields
Maps data to the following field types:

- **Standard**
- **Custom**


## Setup Instructions

### 1. Create & get API Key from Dotdigital

- Go to the [Dotdigital website](https://dotdigital.com) and log into your account.
- At the bottom left corner, click on the profile with cog icon, then click **Access** menu option.
- Click on the **API Users** tab, and then click **New User** button.
- Enter and confirm a password and take note of it for yourself.
- After the page reloads, copy your region-specific API URL and the auto generated API connector email address under the **Email** column.

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- Select *Dotdigital (v2)* from the **Service Provider** select dropdown.
- Enter a name and handle for the integration.
- Paste your region-specific API URL (e.g. https://region-api.dotdigital.com) into the **API URL** field in Freeform.
- Paste the Dotdigital API connector email address into the **API User Email** field in Freeform.
- Enter the chosen password for that API user in the **API User Password** field in Freeform.
- Configure additional settings:
    - **Email Opt In Type** - choose one of the following:
        - _Single_
        - _Double_
        - _Verified Double_
    - **Email Type** - choose one of the following:
        - _Plain Text_
        - _HTML_
- Click the **Save** button.

### 3. Verify Authorization

- After the integration is saved, it'll return you to the list of mailing list integrations.
- Click into the newly created integration.
- Confirm that there is green circle with **Authorized** in the middle of the page.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Dotdigital** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Choose a Freeform field to be the target opt-in field.
    - Select a mailing list that new users should be subscribed to.
    - Map Freeform fields to the Dotdigital fields as you wish.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>