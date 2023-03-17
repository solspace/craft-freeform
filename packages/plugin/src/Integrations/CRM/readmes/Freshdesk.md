## Setup Guide
The _Freshdesk_ integration includes support for the following:

* Field mapping to standard and most custom fields.
* Maps data to [Tickets](https://developers.freshdesk.com/api/#tickets) endpoint.
* Duplicate detection will automatically be applied to the email address and a Contact will be created or updated automatically by Freshdesk.

### Setup Instructions

1. Create & get API Key from Pipedrive:
	* Open a new tab and go to your [Freshdesk](https://freshdesk.com) account (e.g. `https://yourcompany.freshdesk.com`) and login.
	* At the top right corner, click on the profile icon and select **Profile Settings**.
	* On the next page, toward the top right side you'll see an input labelled **Your API Key**.
	* Copy that API key to your clipboard.
2. Setup Integration on your site:
	* Enter a name and handle for the integration.
	* Paste the API Key from Freshdesk into the **API Key** field below.
	* In the **Domain** field, enter your Freshdesk helpdesk domain, e.g. `https://yourcompany.freshdesk.com`.
	* Complete the rest of the following optional fields:
		* **Default Type** - set the default **Type** for tickets, e.g. `Question`.
		* **Default Priority** - set the default **Priority** for tickets, e.g. `1` (low).
		* **Default Status** - set the default **Status** for tickets, e.g. `2` (open).
		* **Default Source** - set the default **Source** for tickets, e.g. `1` (email), `2` (portal), etc.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of CRM integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>