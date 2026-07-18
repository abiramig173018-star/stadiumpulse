# StadiumPulse

GenAI-powered crowd management & safety alert dashboard for FIFA World Cup 2026
volunteers and venue staff.

## Stack
- React + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Gemini API (`@google/genai`) — see `/api`

## Structure
```
src/
  components/
    Dashboard.jsx           top-level layout, owns incident history state
    GenAIExplainer.jsx        collapsible panel mapping features to the brief
    ErrorBoundary.jsx          catches render errors per-panel
    IncidentIntake.jsx       free-text report → GenAI structured alert card
    BroadcastTranslator.jsx    language selector + translated broadcast text
    ShiftBriefing.jsx        on-demand AI summary for shift handover
    ZoneGrid.jsx             8-zone grid
    ZoneCard.jsx                single zone: name, %, gauge bar, occupancy
    AlertFeed.jsx            scrollable live alert panel
    AlertItem.jsx               single alert row
  lib/
    crowdSimulator.js       simulated zone data + useCrowdData() hook
    gauge.js                green/amber/red threshold logic for the UI
    alertFeed.js            derives alerts from zone state changes + useAlertFeed()
    apiClient.js             shared fetch helper with clear error messages
    types.js                 JSDoc shape definitions (Zone, Alert, IncidentAnalysis)
    __tests__/                Vitest unit tests
  App.jsx                   renders <Dashboard />
api/
  analyze-incident.js       Vercel fn — Gemini call, grounded in live zone data
  translate.js               Vercel fn — translates a broadcast message
  briefing.js                Vercel fn — summarizes zones + alerts + incidents
```

## GenAI setup
`api/analyze-incident.js` needs a `GEMINI_API_KEY` (from Google AI Studio) set
as an environment variable — locally in `.env.local`, and in Vercel's project
settings once deployed. The key is only ever read server-side.

## Getting started
```bash
npm install
npm run dev
```

## Status
✅ Scaffold — React + Vite + Tailwind wired up, folder structure in place
✅ Crowd simulation engine (`src/lib/crowdSimulator.js`) — 8 zones, random walk + spikes, `useCrowdData()` hook
✅ Dashboard UI (`src/components/`) — zone cards with green/amber/red gauges, live alert feed panel
✅ GenAI incident intake (`api/analyze-incident.js` + `src/components/IncidentIntake.jsx`) — free-text report → structured alert via Gemini, grounded in live zone data
✅ Multilingual broadcast translation (`api/translate.js` + `src/components/BroadcastTranslator.jsx`) — English/Spanish/Portuguese/French, per-language caching
✅ AI shift briefing (`api/briefing.js` + `src/components/ShiftBriefing.jsx`) — on-demand summary of zones + alerts + recent incidents
✅ Deployed to Vercel
✅ Unit tests (`npm run test`) — gauge thresholds, crowd simulation bounds, alert-feed transitions (13 tests, Vitest)
✅ Accessibility pass — labeled form controls, live regions on dynamic content (alerts, incident analysis, briefing), landmark structure
✅ Error boundaries around each GenAI-dependent panel — a bad API response can't blank the whole dashboard
✅ In-app "How this uses Generative AI" panel mapping features to crowd management, multilingual assistance, and operational intelligence

## Environment
Copy `.env.example` to `.env.local` and add your Gemini API key
(from Google AI Studio). Never call it from client-side code —
always route through `/api`.
