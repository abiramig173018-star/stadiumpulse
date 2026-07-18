import { GoogleGenAI, Type } from "@google/genai";

/**
 * POST /api/briefing
 * Body: { zones: Zone[], alerts: Alert[], incidents: IncidentRecord[] }
 *
 * Summarizes the current state of the venue into a short shift-handover
 * briefing a supervisor can read in under 10 seconds. Grounded in the same
 * live zone data as the rest of the app, plus recent auto-generated zone
 * alerts and recent staff-submitted incident reports.
 */

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

const MAX_ITEMS = 10;

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: { type: Type.STRING },
  description: "3 to 5 short, plain-language shift briefing bullet points.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { zones, alerts, incidents } = req.body ?? {};

  if (!Array.isArray(zones) || zones.length === 0) {
    return res.status(400).json({ error: "Missing current zone data." });
  }

  const zoneSummary = zones.map((z) => ({
    name: z.name,
    occupancyPercent: Math.round((z.ratio ?? 0) * 100),
  }));

  const alertSummary = (Array.isArray(alerts) ? alerts : [])
    .slice(0, MAX_ITEMS)
    .map((a) => `${a.zoneName ?? "Unknown zone"}: ${a.message}`);

  const incidentSummary = (Array.isArray(incidents) ? incidents : [])
    .slice(0, MAX_ITEMS)
    .map((i) => `[${i.severity}] ${i.category} — ${i.recommendedAction}`);

  const prompt = `You are briefing an incoming stadium operations supervisor at shift handover.

Current zone occupancy:
${JSON.stringify(zoneSummary, null, 2)}

Recent automated zone alerts:
${alertSummary.length ? alertSummary.join("\n") : "None."}

Recent staff-reported incidents:
${incidentSummary.length ? incidentSummary.join("\n") : "None reported this shift."}

Write a shift briefing the supervisor can read in under 10 seconds: 3 to 5 short bullet points covering current risk zones, any notable incidents, and anything they should keep an eye on. Plain language, no jargon, no restating raw percentages unless a zone is genuinely a concern.`;

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const bullets = JSON.parse(response.text);
    return res.status(200).json({ bullets, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("briefing failed:", error);
    return res.status(500).json({ error: "Failed to generate briefing. Please try again." });
  }
}
