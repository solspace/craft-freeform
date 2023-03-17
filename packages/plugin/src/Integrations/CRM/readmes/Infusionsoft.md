## Setup Guide
The _Infusionsoft_ integration includes support for the following:

* Field mapping to standard and custom fields in *Contacts*.
* Duplicate detection is based on the email address.

### Setup Instructions

The Infusionsoft API integration is a little more complicated since they include another layer of API calls by using *Mashery* API Management. Please carefully follow the steps below.

1. Prepare your site's end for Integration:
	* Enter a name and handle for the integration.
		* In the **OAuth 2.0 Return URI** field, a URL will be automatically populated for you. Do not change or adjust this.
	* Copy the URL in the **OAuth 2.0 Return URI** field to your clipboard.
	* Leave this page open.
2. Sign up for a *Mashery* API Management account:
	* Infusionsoft runs it's API through Mashery, so you will need to sign up or log into a Mashery account inside the Infusionsoft Developers site.
	* [Visit the Infusionsoft Developers site site to sign up for or log into a Mashery account](https://keys.developer.infusionsoft.com/apps/myapps)
	* Fill out the form and then click **Register** button.
	* You'll receive a confirmation email with a link to click to verify your account.
3. Create Mashery API Application:
	* After verifying your account, click the [create a new application](https://keys.developer.infusionsoft.com/apps/register) button to begin creating your API app.
	* Fill out the form, and paste the **OAuth 2.0 Return URI** value from Freeform into the **Register Callback URL** field in Mashery.
	* Then click the **Register Application** button.
	* You'll be returned to a page that shows you your `client_id` and `client_secret`. Please take note of these and/or leave the browser tab open.
4. Prepare the Connection:
	* Go back to your Craft/Freeform browser tab.
	* Copy the `client_id` value from Infusionsoft and paste it into the the **Client ID** field below.
	* Copy the `client_secret` value from Infusionsoft and paste it into the the **Client Secret** field below.
	* Click the **Save** button.
5. Finish the Connection:
	* You will then be presented an Infusionsoft OAuth login form.
	* If not already logged in, enter in your Infusionsoft login details and click **Log In** button.
	* Once logged in, you'll be presented an OAuth form, asking if you want to allow access. Click **Allow** button.
	* You should now be returned to the Freeform CRM setting page.
	* Confirm that there is a green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

### Additional Information

* For mapping to Provinces or States, you'll map to the **Region** field. The **Region** field expects values like `US-CA` for California state in USA, or `CA-MB` for Manitoba province in Canada. When mapping to Regions, it's required you map the Country code as well.
* Country code mapping uses 3-digit codes like `USA` for United States of America, `CAN` for Canada, `GBR` for United Kingdom, etc.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>