## Setup Guide
The _Salesforce Lead_ integration includes support for the following:

* Field mapping to standard and custom *Lead* object fields:
	* Text fields: String, Textarea, Email, URL, Address, Picklist, Multipicklist, Date/Time fields
	* Numeric fields:, Number, Phone, Currency
	* Other fields:, Reference/relationship
	* There are some limitations to types of fields that can be mapped, such as **Lookup** fields.

> **Warning**: This integration will not work with the _Salesforce **Essentials**_ plan as it does not have access to the API.

### Setup Instructions

1. Prepare Salesforce's end for Integration:
	* Open another browser tab and go to [Salesforce website](https://login.salesforce.com) and log into your account.
	* On the left navigation menu, click on **Apps**, then click **App Manager**.
	* At the top right corner of the page, click the **New Connected App** button.
	* Fill out the fields in the **Basic Information** section.
	* In the **API (Enable OAuth Settings)** section, click the **Enable OAuth Settings** checkbox.
	* More fields will appear. In the **Callback URL** field, enter any valid URL that begins with **https** (it could even be **https://google.com**, as we don't use this part).
	* In the **Selected OAuth Scopes** field, select the following permissions from the list and click **Add** arrow button:
		* **Allow access to your unique identifier (openid)**
		* **Perform requests on your behalf at any time (refresh_token, offline_access)**
	* You shouldn't need to fill out any further fields, and then click **Save** button.
	* You will be taken to a new page that lists info about your newly created app, including **Consumer Key** and **Consumer Secret** values. You will need to copy each of these values.
		* Salesforce gets tricky to navigate, so do yourself a favor and copy and paste these 2 values into a text editor for now, being sure to label each too. You'll save yourself some extra steps later on.
	* At the top middle of the page, click on the **Manage** button.
	* At the top middle of the next page, click the **Edit Policies** button.
	* Under the **OAuth policies** section, adjust the following settings:
		* In the **Permitted Users** field, be sure that it is set to **All users may self-authorize**.
		* In the **IP Relaxation** field, change the setting to **Relaxed IP restrictions**.
		* Click **Save** button at bottom of page.
	* If you copy and pasted the **Consumer Key** and **Consumer Secret** values in a text editor, you can skip these next couple steps:
		* To go back to your app to see these values, click on the **App Manager** navigation item (under **Apps**)
		* Find your app in the list. Then in the right column, click the down arrow, and then click **View**.
2. Setup Integration on your site:
	* Enter a name and handle for the integration.
	* Enter Salesforce credentials in the next 4 fields below:
		* Paste the Salesforce **Consumer Key** value into the **Client ID** field.
		* Paste the Salesforce **Consumer Secret** value into the **Client Secret** field.
		* Enter your Salesforce account username/email address into the **Username** field.
		* Enter your Salesforce account password into the **Password** field.
	* Additional configuration options:
		* **Assign Lead Owner?** - Enabling this will make Salesforce assign a lead owner based on lead owner assignment rules in Salesforce.
		* **Sandbox Mode** - Enable this if your Salesforce account is in Sandbox mode.
		* **Using custom URL?** - Enable this if you connect to your Salesforce account with a custom company URL such as `mycompany.my.salesforce.com`.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of CRM integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>