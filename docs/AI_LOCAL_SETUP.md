# Running a local Ollama model for DataMarg AI Mentor

This document explains how to run Ollama locally and configure the DataMarg app to use it as the AI provider.

Important: Do not expose your local Ollama instance to the public internet. This setup is for local development or private deployments only.

Prerequisites
- Install Ollama: https://ollama.com/docs
- Ensure Docker (if required by the model) is available and working

Steps

1. Install Ollama (macOS / Linux / Windows as per docs).

2. Start ollama server (if not already running):

   ollama run --detach

   Confirm it is running:

   curl http://localhost:11434/api/ping

   Expected: HTTP 200 or simple health response.

3. Pull or install a local open-weight model. Example (replace with the model you want):

   ollama pull openassistant/galactica (example)

   or follow model docs: `ollama pull <owner>/<model>`

4. Configure DataMarg environment variables (.env.local):

   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=<your-model-name>
   OLLAMA_TIMEOUT_MS=20000

   (Do not commit .env.local to source control.)

5. Start DataMarg (development):

   npm install
   npm run dev

6. Use the app
- Log in as a user
- Navigate to a page containing the ChatPanel component
- Ask a question — the server will call your local Ollama instance and return a response

Troubleshooting
- Connection refused: ensure Ollama is running and OLLAMA_BASE_URL is correct
- Model not found: confirm the model name with `ollama ls` and set OLLAMA_MODEL accordingly
- Timeouts: increase OLLAMA_TIMEOUT_MS
- Response is NDJSON/streaming: the provider attempts to parse JSON and falls back to raw text

Notes
- The app never calls Ollama from the browser; the server-side `/api/ai/chat` route mediates all requests.
- Keep data privacy in mind: do not enable transcript logging unless you have a consent policy.
- This documentation is for local/dev use. For production deployments consider hardened network controls and model licensing.
