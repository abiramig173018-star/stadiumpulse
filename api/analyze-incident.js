import { GoogleGenAI, Type } from "@google/genai";

/**
 * POST /api/analyze-incident
 * Body: { report: string, zones: Zone[] }
 *
 * Takes a free-text incident report from staff, grounds it in the current
 * live zone data, and asks Gemini to return a structured alert. This is a
 * Vercel serverless function so the API key never touches the client —
 * GoogleGenAI reads GEMINI_API_KEY from the server environment only.
 */

// Lazily create the client inside the handler (not at module load) so a
// missing env var surfaces as a clean 500 instead of crashing cold starts.
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

const MAX_REPORT_LENGTH = 600;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    zone: {
      type: Type.STRING,
      description:
        "The zone id this incident most likely concerns (must match one of the zone ids passed in), or \"stadium-wide\" if it isn't specific to one zone.",
    },
    severity: {
      type: Type.STRING,
      description: "One of: low, medium, high, critical.",
    },
    category: {
      type: Type.STRING,
      description: "One of: medical, security, crowd-control, maintenance, other.",
    },
    recommendedAction: {
      type: Type.STRING,
      description: "A short, specific instruction for on-site staff — what to actually do next.",
    },
    broadcastMessage: {
      type: Type.STRING,
      description:
        "A short calm message suitable for a public announcement to attendees, if one is warranted. Empty string if not.",
    },
  },
  required: ["zone", "severity", "category", "recommendedAction", "broadcastMessage"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { report, zones } = req.body ?? {};

  if (typeof report !== "string" || report.trim().length === 0) {
    return res.status(400).json({ error: "Missing incident report." });
  }
  if (report.length > MAX_REPORT_LENGTH) {
    return res.status(400).json({ error: `Report must be under ${MAX_REPORT_LENGTH} characters.` });
  }
  if (!Array.isArray(zones)) {
    return res.status(400).json({ error: "Missing current zone data." });
  }

  // Only pass Gemini what it needs to reason about — not internal fields
  // like `spiked` or React-only state.
  const zoneSummary = zones.map((z) => ({
    id: z.id,
    name: z.name,
    occupancyPercent: Math.round((z.ratio ?? 0) * 100),
  }));

  const prompt = `You are a stadium operations assistant helping volunteer staff triage incident reports during a live event.

Staff incident report: "${report.trim()}"

Current zone occupancy:
${JSON.stringify(zoneSummary, null, 2)}

Analyze the report in the context of the zone data and return a structured response staff can act on immediately.`;

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

    const data = JSON.parse(response.text);
    return res.status(200).json(data);
  } catch (error) {
    console.error("analyze-incident failed:", error);
    return res.status(500).json({ error: "Failed to analyze incident. Please try again." });
  }
}
