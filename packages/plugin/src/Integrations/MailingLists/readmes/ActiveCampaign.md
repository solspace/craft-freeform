## Setup Guide
The _ActiveCampaign_ integration includes support for the following:

* Field mapping to all standard and custom fields.
* Field mapping to Contact Tags ([see further below](#additional)).
* Duplicate check on *Contact* email address (will update other details if it matches instead of creating a new contact).

### Setup Instructions

1. Create & get API Key from ActiveCampaign:
	* Open a new tab and go to [ActiveCampaign website](https://www.activecampaign.com) and log into your account.
	* At the bottom left corner, click on the Settings nav menu option / gear icon (above profile icon).
	* On the next page, click the **Developer** subnav option near the middle of the page.
	* Leave the tab open and go back to this page in the Craft control panel...
2. Setup Integration on your site:
	* Enter a name and handle for the integration.
	* Copy the value in the **URL** field from ActiveCampaign and paste it into the **API URL** field below.
	* Copy the value in the **Key** field from ActiveCampaign and paste it into the **API Key** field below.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of Email Marketing integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

<a name="additional"></a>

### Additional Information

When mapping to _Contact Tags_, you can use any type of Freeform field you like, allowing for the most flexibility for all workflows. If you wish to have the user select their own tags, Freeform will automatically map over option value(s) from option fields such as checkbox groups, select fields, etc. If you wish to have tags forced upon submitters, you can include a Hidden or Invisible field type and include tag(s) in the value in the form builder. When specifying multiples, separate each with a semi-colon (`;`), e.g. `basic;premium;premium plus;preferred`.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>