## Setup Guide
The _Stripe Payments_ integration includes support for the following:


### Requirements

* [Stripe](https://stripe.com) account
* All API requests must be made over [HTTPS](https://en.wikipedia.org/wiki/HTTPS)
	* Can be tested in Test Mode while using HTTP however.
* Publicly accessible site to **fully** test or use Stripe.
	* You can forego **webhooks** testing (Payments success/fail email notifications, payment status future updates) if you like however, and use non-public local dev site.
	* To fully test or use the **webhooks** part of Stripe payment gateway on a local dev machine, you can work around this by using a service like **[ngrok](https://ngrok.com/product)**. You can still access your site via the local dev URL, as long as the public version is working and Stripe is aware of it.

### Setup Instructions

1. Provide your integration a name in the **Name** and **Handle** fields below.
2. Open a new tab and go to your Stripe account:
	* On the left nav menu, click on **Developer**, then click **API Keys**.
	* Copy the LIVE token for **Publishable key** (e.g. `pk_live_fs7f6f8g8dfg68g68d76dgd8`) and paste into the **Public Key (Live)** field inside Freeform.
	* Copy the LIVE token (click *Reveal live key token* button to reveal) for **Secret key** (e.g. `sk_live_af7fa7gfdo78g6ddfg6d8d87`) and paste into the **Secret Key (Live)** field inside Freeform.
	* Toggle the *View test data* link at the bottom left corner in Stripe account area (or top right in API Key page) to allow testing your setup. Stripe will provide you with a **different** set of keys for testing mode.
	* Copy the TEST token for **Publishable key** (e.g. `pk_test_fs7f6f8g8dfg68g68d76dgd8`) and paste into the **Public Key (Test)** field inside Freeform.
	* Copy the TEST token (click *Reveal live key token* button to reveal) for **Secret key** (e.g. `sk_test_af7fa7gfdo78g6ddfg6d8d87`) and paste into the **Secret Key (Test)** field inside Freeform.
	* Enable the *LIVE mode* toggle whenever you are ready to have your Payment forms go live. Freeform Payments will then switch to using the LIVE Stripe API tokens.
3. Save the integration inside Freeform. Then, reopen the integration you just created by clicking on it in Freeform.
4. Copy the URL value inside the **Webhook URL** field in Freeform (e.g. `http://my-precio.us/freeform/payment-webhooks/stripe?id=1`).
5. Switch back to your Stripe account browser tab:
	* On the left nav menu, click on **Developer**, then click **Webhooks**.
	* Under the *Endpoints receiving events from your account* section (you may see more endpoint options), click the **+ Add endpoint** button.
	* Paste the webhook URL you copied from Freeform into the modal window that pops up.
	* You can likely use **latest** or **default** option for *Webhook version* without any consequence.
	* Select **Send all event types** option for *Filter event* setting. Specifically, these are the 4 that Freeform actually just needs:
		* `customer.subscription.created`
		* `customer.subscription.deleted`
		* `invoice.payment_failed`
		* `invoice.payment_succeeded`
	* Click **Add Endpoint** button to save it.
	* On the next page inside Stripe account, click on the newly created Endpoint URL.
	* At the bottom of the next page, you'll see a section titled **Signing secret**.
	* Click on the **Click to reveal** button, and then copy the token (e.g. `whsec_dsf87d876sdf7g876fd8fasd9f7dsasd`).
6. Switch back to the Payment integration inside Freeform, and paste the Signing secret token into the **Webhook Secret** setting.
7. Save the integration again, and it should be ready.
8. You can now use this integration inside the form builder (and finish configuring per form there).

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>