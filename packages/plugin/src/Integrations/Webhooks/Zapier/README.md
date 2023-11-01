# Setup Guide
The Zapier integration allows you to map Freeform submission data off to virtually every popular service available such as Slack, Trello, Google Docs, Salesforce, Mailchimp, and more! You can setup as many as you like.

We will assume you already have a [Zapier](https://zapier.com/) account and some general knowledge about how to use it. While it seems just about anything is available with the free version of Zapier, having many *Zaps* and/or complex *workflows* will require [purchasing a paid plan](https://zapier.com/pricing).

## Setup Instructions

### 1. Prepare Integration on your site

- For *Service Provider*, select **Zapier**.
- Enter a name for the **Name** field.
- Pause here and open a new browser tab...

### 2. Create a new <i>Zap</i>

- Go to the [Zapier website](https://zapier.com/app/zaps) and create a new *Zap* (by clicking the bright orange *Make a Zap!* button at the top of the page).
- For the *Choose App* option, select **Webhooks by Zapier**.
- For the *Choose Trigger Event* option, select **Catch Hook**.
- Proceed to the next step, and then you'll be presented the webhook URL (e.g. `https://hooks.zapier.com/hooks/catch/12345/67890/`)
- Pause here and copy the *Custom Webhook URL* and switch back to your Freeform tab.

### 3. Finish Integration on your site

- Paste the *Custom Webhook URL* you copied earlier into the **Webhook URL** field in Freeform.
- Click the **Save** button.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Zapier** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.

### 5. Send test data to Zapier

In order for Zapier to know that Freeform exists and what data is available to it, you need to submit a test submission for the form(s) that will be using the webhook/Zap. Go to your form in the front end and submit the form with as much sample data as possible. Zapier will then be listening for the data... 

### 6. Finish creating the new <i>Zap</i>

- Switch back to the Zapier browser tab.
- Click the **Refresh Fields** button.
- Click on the next step, and choose an example submit Zapier sniffed from your test submission.
- Proceed to the next step and setup your output "Do this..." section as necessary (can be anything, so we can't fully provide steps for this part).
- Once all done, save the Zap and be sure to switch the **OFF** toggle to **ON** before trying to use the *Zap*.

### 7. Verify the Webhook

- Try submitting one of your forms that use this webhook, and check if Freeform posts successfully to it and Zapier maps correctly.
- If there are any issues on Freeform's end, you'll see errors in the Freeform error log. If there's an issue on Zapier's end, you'll see errors inside Zapier.

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>