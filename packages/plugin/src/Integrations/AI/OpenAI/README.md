# OpenAI

This integration allows you to use [OpenAI](https://openai.com)'s AI models for processing in form submissions.

Once you enable and configure an AI integration, various AI functionality becomes available in Freeform, including the AI field type. Use it to provide a system prompt with instructions for how the model should process submission data (e.g., categorization, summarization, sentiment analysis, content generation). Specify the exact output format you need.

## Setup Instructions

### 1. Create & get API Key from OpenAI

Visit your [account settings area](https://platform.openai.com/api-keys) on the OpenAI site to get your API key.

### 2. Configure the Integration

- Copy and paste your API key into the integration in Freeform.
- Select the AI model you want to use. The default is `gpt-5.6-luna`.
  - After entering an API key, search the models available to that key. Use **Other / Custom model ID** if your model is not listed. Existing model selections are kept when they are not in the list.
  - When choosing a model, consider that AI processing can potentially hold up form submission processing for the user submitting the form, so try to choose a more light-weight model.
- Leave **Reasoning Effort** at **Model default** to use OpenAI's default, or select a level supported by your model. Freeform uses this setting for both form generation and submission processing. Higher levels may take longer and use more tokens.
- Configure **Max Tokens**. This allowance includes reasoning and generated content. Create with AI respects this integration setting; large PDFs and higher reasoning levels may need a larger allowance. AI fields can override it per form.
- Click the **Save** button.

#### Recommended Models

- ⚡ `gpt-5.6-luna` — fast + cheap
  - High-volume and cost-sensitive workloads
- ⚖️ `gpt-5.6-terra` — balanced
  - Balance of intelligence, speed, and cost
- 🧠 `gpt-5.6-sol` — smartest
  - Complex reasoning, coding, and professional workflows

### 3. Authorize the Integration

- After the integration is saved, you will see an **Authorize** button appear.
- Click the **Authorize** button.
- If authorized successfully, you'll see a green _Authorized_ status at the top beside the integration name.

### 4. Configure the Form

To use this integration on your form(s), you'll need to configure each form individually.

- Visit the form inside the form builder.
- Click on the **Integrations** tab.
- Click on **OpenAI** in the list of available integrations.
- On the right side of the page:
  - Enable the integration.

### Create with AI

Compatible OpenAI models use the Responses API in background mode. Freeform submits the reference once and saves its response ID, then retrieves progress through short requests. You do not need to run a Craft queue listener for this OpenAI generation path. Older models and other providers retain their existing queue behavior.

You can close the dialog and reopen **Create with AI** in the same browser to resume. OpenAI continues working while the dialog is closed; Freeform retrieves and saves the completed form when you return. Completion shows an **Open form** button; it never redirects you automatically or interrupts another form you are editing. Reopen within one hour. This does not require a webhook or an always-running worker.

Only an opaque Freeform request identifier and its start time are saved in browser storage. The elapsed timer includes waiting and time spent with the dialog closed, and stops when Freeform confirms completion or failure. It measures time since submission, rather than OpenAI processing time alone. Reference files and the provider response ID are held in encrypted, temporary server storage. Background requests use `store: true` so the result remains retrievable beyond OpenAI's short default polling window; OpenAI's account-specific data retention rules still apply. See [OpenAI background mode](https://developers.openai.com/api/docs/guides/background).

Freeform imports only a complete, valid response. If the output allowance is exhausted, increase **Max Tokens** or try a smaller section. A connection failure during the initial submission may leave its outcome unknown; Freeform does not automatically submit it again. Check progress and the Forms list before starting another request.
