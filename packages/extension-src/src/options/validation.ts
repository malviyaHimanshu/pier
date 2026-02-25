export function validateConnectionFields({
  wsUrl,
  token
}: {
  wsUrl: string;
  token: string;
}) {
  if (!wsUrl) {
    return "WebSocket URL is required.";
  }
  try {
    const parsed = new URL(wsUrl);
    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      return "WebSocket URL must use ws:// or wss://";
    }
  } catch {
    return "WebSocket URL is invalid.";
  }
  if (!token) {
    return "Access token is required.";
  }
  return null;
}
