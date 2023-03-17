## Setup Guide
The _Constant Contact_ integration includes support for the following:

* Field mapping to most standard fields and custom fields.
* If a duplicate email address is found in Constant Contact, the profile data will be updated with the latest information submitted.

### Setup Instructions

1. Prepare your site's end for Integration:
	* Enter a name and handle for the integration.
		* In the **Redirect URI** field, a URL will be automatically populated for you. Do not change or adjust this.
	* Copy the URL in the **Redirect URI** field to your clipboard.
	* Leave this page open.
2. Prepare Constant Contact's end for Integration:
	* Open a new tab and go to Constant Contact's API [*My Applications* website](https://app.constantcontact.com/pages/dma/portal/).
	* Log into your Constant Contact account there.
	* Go to the **My Applications** page (click at top nav menu).
	* Click on the **New Application** button at top right.
	* Enter a name for the application in the modal window that pops up, and click **Save**. Leave the other 2 settings as they are defaulted.
	* On the next page, paste the value you copied from Freeform's **Redirect URI** field into the Constant Contact **Redirect URI** field.
	* Fill out the rest of the form if you like, and then click the **Save** button at the top right.
	* On the **My Applications** list page, click on your newly created application.
	* Copy the `API Key` value from Constant Contact.
	* Click the **Generate Secret** button beside the API Key field, and then copy the `App Secret` value from Constant Contact.
3. Prepare the Connection:
	* Go back to your Craft/Freeform browser tab.
	* Paste the `API Key` value from Constant Contact into the the **API Key** field below.
	* Paste the `App Secret` value from Constant Contact into the the **App Secret** field below.
	* Click the **Save** button.
4. Finish the Connection:
	* You will then be presented a Constant Contact OAuth confirmation page.
	* If not already logged in, enter in your Constant Contact login details and click **Log In** button.
	* Once logged in, you'll be presented an OAuth form, asking if you want to allow access. Click **Allow** button.
	* You should now be returned to the Freeform Email Marketing setting page.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>