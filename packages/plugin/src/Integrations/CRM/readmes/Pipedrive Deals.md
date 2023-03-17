## Setup Guide
The _Pipedrive Deals_ integration includes support for the following:

* Field mapping to standard and custom fields.
* Duplicate detection on Persons email address (and updating contact info if matches).
* Maps data to the [Deals](https://developers.pipedrive.com/docs/api/v1/#!/Deals), [Persons](https://developers.pipedrive.com/docs/api/v1/#!/Persons), [Organizations](https://developers.pipedrive.com/docs/api/v1/#!/Organizations) and [Notes](https://developers.pipedrive.com/docs/api/v1/#!/Notes) endpoints.

### Setup Instructions

1. Create & get API Key from Pipedrive:
	* Open a new tab and go to [Pipedrive](https://pipedrive.com) and log into your account.
	* At the top right corner, click on the profile icon and select **Personal Preferences**.
	* On the next page near the top right of the secondary navigation menu, click the **API** option.
	* Click the **Generate new token** link and copy the newly created token.
2. Setup Integration on your site:
	* Enter a name and handle for the integration.
	* Paste the Pipedrive API token into the **API Token** field in Freeform.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of CRM integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

### Additional Information
If you want to specify which user and/or deal stage the leads go into, you can specify the unique ID's for each of those in the **User ID** and **Stage ID** fields, but this is optional. There seems to be no visual way in Pipedrive to see what the ID's are, so you'll likely need to do something like right-clicking on a Stage name / User name link to view the ID in a URL. So for example, to get the Stage ID, go to the **Settings** area and click on **Pipelines**. Right-click on a stage name and copy the link. You'll get something like: `https://yourcompany.pipedrive.com/stages/edit/3.json` (where `3` is the stage ID in this case). The stage ID is unique, so Pipedrive will automatically know which pipeline you're referring to when you specify the stage ID.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>