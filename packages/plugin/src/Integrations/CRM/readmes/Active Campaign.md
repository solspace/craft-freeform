## Setup Guide
The _ActiveCampaign_ integration includes support for the following:

* Field mapping to all standard and custom fields.
* Duplicate check on *Contact* email address (will update other details if it matches instead of creating a new contact).
* Duplicate check on *Organization* name (will use an existing organization if the value matches instead of creating a new one).

### Setup Instructions

1. Create & get API Key from ActiveCampaign:
	* Open a new tab and go to [ActiveCampaign website](https://www.activecampaign.com) and log into your account.
	* At the bottom left corner, click on the Settings nav menu option / gear icon (above profile icon).
	* On the next page, click the **Developer** subnav option near the middle of the page.
	* Leave this tab open and go back to the Craft control panel...
2. Setup Integration on your site:
	* Enter a name and handle for the integration.
	* Copy the value in the **URL** field from ActiveCampaign and paste it into the **API URL** field below.
	* Copy the value in the **Key** field from ActiveCampaign and paste it into the **API Key** field below.
	* In the **Pipeline** field, enter the name or ID of the ActiveCampaign Pipeline you wish to have *Deal* data sent to, e.g. `My Pipeline`.
	* In the **Stage** field, enter the name or ID of the ActiveCampaign Stage you wish to have *Deal* data sent to, e.g. `To Contact`.
	* In the **Owner** field (optional), enter the username or ID of the ActiveCampaign user to assign as the *Deal* owner.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of CRM integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

### Additional Information
When setting up the form inside the form builder, please be sure to map all required fields for *Deal*:

* _Currency_, e.g. use a hidden field that contains `usd` or `eur`.
* _Owner_ (ID), e.g. use a hidden field that contains `1`.
* _Value_ ($ amount), e.g. use a hidden field that contains `500.00` or a regular input/select that allows the user to select the value, etc.

If you want the form submitter to automatically (or optionally) be opted into an ActiveCampaign mailing list, use a hidden field or select, radio, checkbox, etc that contains the ID of the mailing list you wish to have them subscribed to. Then map that field to the **Mailing List ID** field under *Contact*.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>