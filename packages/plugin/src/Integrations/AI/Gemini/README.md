# Gemini AI

This integration allows you to use [Google Gemini](https://gemini.google.com)'s AI models for processing in form submissions.

Once you enable and configure an AI integration, various AI functionality becomes available in Freeform, including the AI field type. Use it to provide a system prompt with instructions for how the model should process submission data (e.g., categorization, summarization, sentiment analysis, content generation). Specify the exact output format you need.

## Setup Instructions

### 1. Create & get API Key from Gemini

Visit the [Google AI Studio](https://aistudio.google.com/app/apikey) site to get your API key.

### 2. Configure the Integration

- Copy and paste your API key into the integration in Freeform.
- Select the AI model you want to use. The default is `gemini-3.5-flash-lite`.
  - When choosing a model, consider that AI processing can potentially hold up form submission processing for the user submitting the form, so try to choose a more light-weight model.
- Configure the Max Tokens and Temperature settings. These can be overrided per form.
- Click the **Save** button.

#### Recommended Models

- ⚡ `gemini-3.5-flash-lite` — fast + cheap
  - Most workloads
- ⚖️ `gemini-3.5-flash` — balanced
  - Most general-purpose workloads
- 🧠 `gemini-3.1-pro-preview` — smartest
  - Hard reasoning / planning

### 3. Authorize the Integration

- After the integration is saved, you will see an **Authorize** button appear.
- Click the **Authorize** button.
- If authorized successfully, you'll see a green _Authorized_ status at the top beside the integration name.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **Gemini** in the list of available integrations.
- On the right side of the page:
  - Enable the integration.
