# SolspaceAI Integration

Use your own SolspaceAI (LiteLLM) proxy as the AI provider for Freeform AI fields. The proxy can run local models (e.g. smollm2 via Docker Model Runner) or any OpenAI-compatible backend.

## Setup

1. **Run the LiteLLM proxy** (see the [Solspace AI / LiteLLM](https://github.com/solspace/ai) repo):  
   `docker compose up -d` so the proxy is available (e.g. at `http://localhost:4000`).

2. **In Freeform**: Add the **SolspaceAI** integration (Settings → Integrations → AI → SolspaceAI).

3. **Configure**:
   - **API Key**: Your proxy master key or a virtual key (e.g. `sk-master-1234`).
   - **API Base URL**: Proxy base URL without `/v1` (e.g. `http://localhost:4000` or `https://your-proxy.example.com`).
   - **Model**: The model name exposed by your proxy (e.g. `smollm2`).
   - **Max Tokens**: Maximum tokens per response (default 4096).

4. **Test connection** in the integration settings to confirm the proxy is reachable.

## Usage

Add an **AI Summary** (or other AI) field to a form, choose **SolspaceAI** as the integration, and configure the system prompt and fields to process. Submissions will be sent to your proxy and the response will populate the AI field.

## Requirements

- Freeform Pro.
- A running LiteLLM proxy (OpenAI-compatible `/v1/chat/completions` and `/v1/models`).
