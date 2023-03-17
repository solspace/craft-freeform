## Setup Guide
The _Salesforce Opportunity_ integration includes support for the following:

- Field mapping to standard and custom *Opportunity*, *Account* and *Contact* object fields.
- There are some limitations to types of fields that can be mapped, such as **Lookup** fields.
- Two different options for Duplicate Check & Update ([see further below](#duplicates)).

> **Warning**: This integration will not work with the _Salesforce **Essentials**_ plan as it does not have access to the API.

### Setup Instructions

1. Prepare Salesforce's end for Integration:
	* Open a new tab and go to [Salesforce website](https://login.salesforce.com) and log into your account.
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
	* Additional configuration:
		* **Close Date** - Enter a relative textual date string for the Close Date of the newly created Opportunity (e.g. `7 days`).
		* **Stage Name** - Enter the Stage Name the newly created Opportunity should be assigned to (e.g. `Prospecting`).
		* **Sandbox Mode** - Enable this if your Salesforce account is in Sandbox mode.
		* **Append checkbox group field values on Contact update?** - If a Contact already exists in Salesforce, enabling this will append additional checkbox group field values to the Contact inside Salesforce, instead of overwriting the options.
		* **Append checkbox group field values on Account update?** - If an Account already exists in Salesforce, enabling this will append additional checkbox group field values to the Account inside Salesforce, instead of overwriting the options.
		* **Check Contact email address and Account website when checking for duplicates?** - By default, Freeform will check against Contact first name, last name and email address, as well as and Account name. If enabled, Freeform will instead check against Contact email address only and Account website. If no website is mapped, Freeform will gather the website domain from the Contact email address mapped.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of CRM integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

<a name="duplicates"></a>

### Duplicate Check & Update

#### Default Logic

A duplicate check on records is done in the following way:

1. Check whether the *Account* already exists:
	* Check against the **Name** field as the identifier.
		* Freeform will create an *Account* with the **First Name** and **Last Name** mapped to the *Contact* if you leave the *Account* **Name** field empty. This is helpful if you are dealing with customers not necessarily belonging to a company or organization, and just wish to have a Salesforce Account matching the Contact.
	* If no match, create a new *Account*.
2. Check whether the *Contact* already exists:
	* Check against the **Email address** as the identifier.
	* If email address exists in Salesforce *Contact*, update the existing Contact with other details.
	* If no email address match, check if **first name** and **last name** exist in Salesforce *Contact*, then update the existing *Contact* with all other values including the new email address.
	* If no matches at all, create a new Salesforce *Contact*.
	* If *Account* **Name** matched, assign the new Contact to the existing Salesforce Account.
3. Create new *Opportunity*.
	* Attach *Opportunity* to existing or newly created Salesforce *Account*.

#### Alternate Logic

An alternate duplicate check on records is also available. When the **Check Contact email address and Account website when checking for duplicates?** setting is enabled, the following logic will happen instead:

1. Check whether the *Contact* already exists:
	* Check against **Email address** as the identifier.
	* If there's a match, update the *Contact* with new values, where supplied.
	* If no match, create a new *Contact*.
2. Check whether the *Account* already exists:
	* Check against the **Website** field domain. If you are not mapping a domain to the **Website** field, Freeform will automatically sniff the *Contact* email address, take the domain from it and pass it off to the Salesforce *Account* as the **Website** field value.
	* If there's a match, update the *Account* with new values, where supplied.
	* If no match, create a new Salesforce *Account*.
	* If a new *Contact* was created, link the contact to the *Account*.
3. Create new *Opportunity*.
	* Attach *Opportunity* to existing or newly created Salesforce *Account*.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>