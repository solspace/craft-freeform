# Setup Guide
The Slack integration allows you to map Freeform submission data off to Slack and post that data into a conversation or channel, etc. These are created using Slack Webhooks and Apps, and you can setup as many as you like.

## Setup Instructions

### 1. Create a new Slack app

- Go to the [Slack App website](https://api.slack.com/apps/new) and create a new app.
- Click the **Create New App** button and fill out the _App Name_ and choose your _Slack Workspace_ and click the **Create App** button.
- Then click on the **Incoming Webhooks** area of the page.
- On the next page, enable the toggle near the top beside _Activate Incoming Webhooks_ title. You'll then see a new section appear below titled _Webhook URLs for Your Workspace_.
- Click on the **Add New Webhook to Workspace** button near the bottom.
- On the next page, choose which channel or conversation the submissions should be posted to, and then click **Install**.
- Finally, you'll be taken to a new page (under _Incoming Webhooks_) where you can copy the Webhook URL.
- Copy that Webhook URL and save it to your clipboard (e.g. `https://hooks.slack.com/services/GDF765GF7/56DG98GDF/GFSAD675F8DFG7854D4FDF6F`).

### 2. Set up Integration on your site

- Switch back to your Freeform/Craft tab.
- For *Service Provider*, select **Slack**.
- Enter a name for the **Name** field.
- Paste the Slack Webhook URL you copied earlier into the **Webhook URL** field.
- For the **Message** field, enter what you want your content to look like for Slack. This will be the default for new forms, but can be overrided per form inside the form builder. You can use Slack markdown here. See example code below...
- Click the **Save** button.

### 3. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Slack** in the list of available integrations.
- On the right side of the page:
    - Enable the integration.
    - Use the existing default message contents or adjust them specifically for this form as needed.

### 4. Verify the Webhook

Try submitting one of your forms that uses this webhook, and check if Freeform posts successfully to it.

## Example Slack Message

``` twig
Submitted on: _{{ submission.dateCreated|date('l, F j, Y \\a\\t g:ia') }}_
Form: *{{ form.name }}*

{% for field in submission %}
• {{ field.label }}: {{ submission[field.handle] }}
{% endfor %}
```

---

<small>Do you need more from this integration? Is the integration you're looking for not here? Solspace offers [custom software development services](https://docs.solspace.com/support/premium/) to build any feature or change you need.</small>