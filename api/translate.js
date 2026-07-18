import { GoogleGenAI } from "@google/genai";

/**
 * POST /api/translate
 * Body: { text: string, targetLanguage: "en" | "es" | "pt" | "fr" }
 *
 * Translates a broadcast alert for multinational volunteer/staff teams.
 * Kept deliberately simple — plain text in, plain text out, no JSON schema
 * needed for a single string field.
 */

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

const MAX_TEXT_LENGTH = 500;

const LANGUAGE_NAMES = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, targetLanguage } = req.body ?? {};

  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Missing text to translate." });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `Text must be under ${MAX_TEXT_LENGTH} characters.` });
  }
  const languageName = LANGUAGE_NAMES[targetLanguage];
  if (!languageName) {
    return res.status(400).json({ error: "Unsupported target language." });
  }

  // Source alerts are always generated in English — skip the API call
  // entirely if English is requested back.
  if (targetLanguage === "en") {
    return res.status(200).json({ translatedText: text, targetLanguage });
  }

  const prompt = `Translate the following stadium safety announcement into ${languageName}. Preserve the urgency and tone — this may be read aloud to a crowd. Output ONLY the translated text: no quotes, no notes, no explanation.

Text: "${text.trim()}"`;

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const translatedText = response.text.trim();
    return res.status(200).json({ translatedText, targetLanguage });
  } catch (error) {
    console.error("translate failed:", error);
    return res.status(500).json({ error: "Translation failed. Please try again." });
  }
}
