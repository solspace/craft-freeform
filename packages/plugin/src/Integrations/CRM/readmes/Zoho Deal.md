## Setup Guide
The _Zoho Deal_ integration includes support for the following:

* Field mapping to standard and custom fields.
* Maps data to Deals, Contacts and Accounts modules.

### Setup Instructions

1. Prepare Freeform's end for Integration:
	* Enter a name and handle for the integration.
	* Leave this page open...
2. Prepare Zoho's end for Integration:
	* Open a new tab and go to the Zoho *Developer Console* website ([accounts.zoho.com/developerconsole](https://accounts.zoho.com/developerconsole)).
	* Click the **Add Client** button to begin:
		* Choose the **Server-based Applications** card
		* For **Client Name**, enter whatever you like, e.g. `My Website`.
		* For **Homepage URL**, enter the URL of the website you're using this one, e.g. `https://my-precio.us`.
		* For **Authorized Redirect URIs**, enter the automatically generated **OAuth 2.0 Return URI** from the **Freeform CRM Integration** page. e.g. `https://my-precio.us/admin/freeform/settings/crm/myZohoIntegration`
		* Then click **Create** to save the new Client ID.
	* On the next page, take note and copy the *Client ID* and *Client Secret* tokens.
3. Finish the Integration:
	* Flip back to this Freeform CP browser tab.
	* Paste the *Client ID* and *Client Secret* tokens into the *Client ID* and *Client Secret* fields, respectively.
	* Click the **Save** button.
	* You will be redirected to a Zoho login page.
	* Fill in your credentials.
	* Click **Allow** when asked for permissions.
	* You will then be redirected back to the **Freeform CRM Integration** page.
4. Verify Authorization:
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>