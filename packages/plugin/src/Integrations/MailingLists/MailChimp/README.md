## Setup Guide

This documentation page assumes you have read over the [Email Marketing Integration Overview page](README.md). If you have not yet read it, please do so now. We also assume that you have a [Mailchimp](http://mailchimp.com) account already, along with mailing list(s) already created. This integration requires that you have *Freeform Pro*. If you currently have Freeform Lite, you can purchase an upgrade to Freeform Pro.

### Field Compatibility

Mailchimp integration includes support for field mapping to standard and custom fields of the following types:

* Text
* Website
* URL
* Dropdown
* Radio
* Date
* Zip
* Tags
  * To map *Contact Tags*, in the **Tags** field mapping area in the form builder for the form, select a Freeform field that will contain Tag value(s). This could be a select dropdown, a checkbox group, radio field, hidden field, etc. When specifying multiples, separate by comma.
    * By default, the Mailchimp integration will replace/overwrite any existing Contact Tags if it finds an existing contact for the email address in Mailchimp. If you'd like it to append/add to the existing Contact Tags instead, enable the **Append Mailchimp Contact Tags on update instead of overwriting?** setting below.
* Interests/Groups
  * To map a *Contact Interest/Group*, in the **Group or Interest** field mapping area in the form builder for the form, select a Freeform field that will contain an Interest/Group name value(s). This could be a select dropdown, a checkbox group, radio field, hidden field, etc. This can only accept one value at this time, and it should be entered exactly as it is in Mailchimp, e.g. `My Group Name`.
* GDPR consent / Marketing settings
  * To map *GDPR consent / Marketing settings* options, in the **GDPR** field mapping area in the form builder for the form, select the Freeform field(s) which will represent opting into the corresponding options. ANY value included in these will be considered an opt in (regardless of whether it's `yes` or `y`, etc). You will need to map a field to each GDPR setting individually, so you'll likely need to use a seperate checkbox field for each.

### Setup Instructions

1. Create & get API Key from Mailchimp:
	* Go to [Mailchimp website](http://mailchimp.com) and log into your account.
	* Go to the **Extras > API keys** page.
	* Click the **Create A Key** button at the bottom of the page.
	* After the page reloads, copy the newly created key under the **API key** column.
2. Setup Integration on your site:
	* Go to the [Email Marketing section in Freeform Settings](../../setup/settings.md#email-marketing) (**Freeform > Settings > Email Marketing**).
	* Click the **New Email Marketing Integration** at the top right.
	* Select *Mailchimp* from the **Service Provider** select dropdown.
	* Enter a name and handle for the integration.
	* Paste the Mailchimp API key into the **API Key** field in Freeform.
	* At the top right corner of Freeform page, click **Save** button.
3. Verify Authorization:
	* After the integration is saved, it'll return you to the list of mailing list integrations.
	* Click into the newly created integration.
	* Confirm that there is green circle with **Authorized** in the middle of the page.


<h3>Did you know...</h3>
<p>Solspace is not just a plugin company. We also build and maintain websites. In fact, we often help other developers with their website builds. Learn more about our <a href="https://solspace.com/services/second-chair-development">second chair development services</a> today.</p>