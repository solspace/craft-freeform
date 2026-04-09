# Setup Guide

This guide assumes you have a [Dotdigital](https://www.dotdigital.com/) account already.

## Compatibility

Uses `v2` and `v3` of the REST API.

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
- After the page reloads, copy the auto generated API connector email address under the **Email** column.

### 2. Set up Integration on your site

- Switch back to this integration tab.
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

- After the integration is saved, you should see an **Authorize** button at the top of the page.
- Click the **Authorize** button.
- If successful, the _Unauthorized_ flag should now appear green with _Authorized_ at the top.

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
