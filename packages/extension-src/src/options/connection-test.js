async function testConnection(wsUrl) {
  let url;
  try {
    url = new URL(wsUrl);
  } catch {
    return { ok: false, message: "Invalid WebSocket URL." };
  }

  url.protocol = url.protocol === "wss:" ? "https:" : "http:";
  url.pathname = "/health";
  url.search = "";

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store"
    });
    if (!response.ok) {
      return {
        ok: false,
        message: `Bridge health check failed (${response.status}).`
      };
    }
    const payload = await response.json().catch(() => null);
    if (!payload || payload.ok !== true) {
      return {
        ok: false,
        message: "Bridge did not return a valid health response."
      };
    }
    return { ok: true, message: `Bridge reachable at ${url.host}.` };
  } catch {
    return {
      ok: false,
      message: "Bridge unreachable. Start `pier setup` or `pier bridge start`."
    };
  }
}

module.exports = {
  testConnection
};
