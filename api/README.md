# /api

Vercel serverless functions — Gemini calls only ever happen here, never
client-side, so `GEMINI_API_KEY` never reaches the browser.

- `analyze-incident.js` — free-text incident report → structured, severity-tagged alert
- `translate.js` — translates a broadcast message (English/Spanish/Portuguese/French)
- `briefing.js` — summarizes current zones + recent alerts/incidents into a shift briefing

All three require `GEMINI_API_KEY` to be set (locally in `.env.local`, in
Vercel's project Environment Variables once deployed).
