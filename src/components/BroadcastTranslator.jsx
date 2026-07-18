import { useState } from "react";
import { postJson } from "../lib/apiClient";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

/**
 * Shows a GenAI-generated broadcast message with a language selector.
 * Caches each translation per-language so switching back and forth
 * doesn't re-call the API. `message` is always assumed to be the
 * original English text from the incident analysis.
 */
export default function BroadcastTranslator({ message }) {
  const [selectedLang, setSelectedLang] = useState("en");
  const [translations, setTranslations] = useState({ en: message });
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  async function handleLanguageChange(e) {
    const lang = e.target.value;
    setSelectedLang(lang);
    setError(null);

    if (translations[lang]) return; // already cached

    setIsTranslating(true);
    try {
      const data = await postJson("/api/translate", { text: message, targetLanguage: lang });

      setTranslations((prev) => ({ ...prev, [lang]: data.translatedText }));
    } catch (err) {
      setError(err.message || "Couldn't translate that message.");
    } finally {
      setIsTranslating(false);
    }
  }

  const displayedText = translations[selectedLang];

  return (
    <div className="mt-3 p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/20 text-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-indigo-400 uppercase tracking-wider">
          Suggested broadcast
        </span>
        <label htmlFor="broadcast-lang" className="sr-only">
          Broadcast language
        </label>
        <select
          id="broadcast-lang"
          value={selectedLang}
          onChange={handleLanguageChange}
          disabled={isTranslating}
          className="bg-slate-900 border border-indigo-500/30 rounded px-2 py-0.5 text-xs text-indigo-200 focus:outline-none disabled:opacity-50"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div role="status" aria-live="polite">
        {isTranslating ? (
          <span className="text-indigo-300/60 italic">Translating…</span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : (
          <span className="text-indigo-200 italic">"{displayedText}"</span>
        )}
      </div>
    </div>
  );
}
