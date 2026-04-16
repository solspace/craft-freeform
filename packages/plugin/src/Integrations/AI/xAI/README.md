# xAI

This integration allows you to use [xAI](https://x.ai)'s AI models for processing in form submissions.

Once you enable and configure an AI integration, various AI functionality becomes available in Freeform, including the AI field type. Use it to provide a system prompt with instructions for how the model should process submission data (e.g., categorization, summarization, sentiment analysis, content generation). Specify the exact output format you need.

## Setup Instructions

### 1. Create & get API Key from xAI

Visit your the [console area](https://console.x.ai/) on the xAI site to get your API key.

### 2. Configure the Integration

- Copy and paste your API key into the integration in Freeform.
- Select the AI model you want to use. The default is `grok-4.1-fast`.
  - When choosing a model, consider that AI processing can potentially hold up form submission processing for the user submitting the form, so try to choose a more light-weight model.
- Configure the Max Tokens setting. This can be overrided per form.
- Click the **Save** button.

#### Recommended Models

- ⚡ `grok-4.1-fast` — fast + cheap
  - High-volume / low latency apps
- ⚖️ `grok-4.1` — balanced
  - General use, improved accuracy/personality
- 🧠 `grok-4.20` — smartest
  - Advanced reasoning / agent workflows

### 3. Authorize the Integration

- After the integration is saved, you will see an **Authorize** button appear.
- Click the **Authorize** button.
- If authorized successfully, you'll see a green _Authorized_ status at the top beside the integration name.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **xAI** in the list of available integrations.
- On the right side of the page:
  - Enable the integration.
