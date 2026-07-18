/**
 * POSTs JSON and safely parses the response. Exists mainly to turn "the
 * dev server returned an empty body" (e.g. running `npm run dev` instead
 * of `vercel dev`, so /api routes 404 silently) into a message that
 * actually tells you what to check, instead of a raw browser error like
 * "Unexpected end of JSON input".
 */
export async function postJson(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection.");
  }

  const raw = await res.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        "Got an unexpected response from the server. If you're running locally, make sure you started the app with `vercel dev`, not `npm run dev` — plain Vite doesn't run the /api functions."
      );
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  if (data === null) {
    throw new Error(
      "Got an empty response from the server. If you're running locally, make sure you started the app with `vercel dev`, not `npm run dev`."
    );
  }

  return data;
}
