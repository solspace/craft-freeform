## Setup Guide
The _MailChimp_ integration includes support for the following:

* Field mapping to standard and custom fields of the following types: Text, Website, URL, Dropdown, Radio, Date, Zip.
* Field mapping to Tags ([see further below](#additional))
* Field mapping to Interests/Groups ([see further below](#additional))
* Field mapping to GDPR consent / Marketing settings ([see further below](#additional))

### Setup Instructions

1. Create & get API Key from Mailchimp:
	* Open a new tab and go to [Mailchimp website](https://mailchimp.com) and log into your account.
	* Click on your account avatar at bottom left corner and choose **Account & Billing**.
	* On the next page, select the **Extras > API keys** sub navigation option.
	* Click the **Create New Key** button at the bottom of the page.
	* After the page reloads, copy the newly created key under the **API key** column.
2. Setup Integration on your site:
	* Enter a name and handle for the integration.
	* Paste the Mailchimp API key into the **API Key** field below.
	* Click the **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of Email Marketing integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.
	* That's it! You can now use this integration inside the form builder.

<a name="additional"></a>

### Additional Information

The Mailchimp email marketing integration also allows support for *Contact Tags*, individual *Interests/Groups* and *GDPR consent / Marketing settings*.

* To map *Contact Tags*, in the **Tags** field mapping area in the form builder for the form, select a Freeform field that will contain Tag value(s). This could be a select dropdown, a checkbox group, radio field, hidden field, etc. When specifying multiples, separate by comma.
    * By default, the Mailchimp integration will replace/overwrite any existing Contact Tags if it finds an existing contact for the email address in Mailchimp. If you'd like it to append/add to the existing Contact Tags instead, enable the **Append Mailchimp Contact Tags on update instead of overwriting?** setting below.
* To map a *Contact Interest/Group*, in the **Group or Interest** field mapping area in the form builder for the form, select a Freeform field that will contain an Interest/Group name value(s). This could be a select dropdown, a checkbox group, radio field, hidden field, etc. This can only accept one value at this time, and it should be entered exactly as it is in Mailchimp, e.g. `My Group Name`.
* To map *GDPR consent / Marketing settings* options, in the **GDPR** field mapping area in the form builder for the form, select the Freeform field(s) which will represent opting into the corresponding options. ANY value included in these will be considered an opt in (regardless of whether it's `yes` or `y`, etc). You will need to map a field to each GDPR setting individually, so you'll likely need to use a seperate checkbox field for each.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>