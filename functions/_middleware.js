const ALLOWED_EMAIL = "kwonjung86@gw1.kr";

function isLocalhost(url) {
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Keep local development simple. In production, Cloudflare Access should
  // protect the whole Pages site and send the authenticated user's email.
  if (isLocalhost(url)) {
    return context.next();
  }

  const email = context.request.headers.get("cf-access-authenticated-user-email");
  if (email && email.toLowerCase() === ALLOWED_EMAIL) {
    return context.next();
  }

  return new Response(
    JSON.stringify({
      error: "Unauthorized",
      message: "kwonjung86@gw1.kr Google login is required."
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}
