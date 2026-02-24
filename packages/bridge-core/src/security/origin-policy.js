const { isLocalhostHost } = require("../../../shared/src");

function safeParseUrl(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function normalizePageHost(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) {
    return null;
  }

  if (isLocalhostHost(raw)) {
    return raw;
  }

  if (raw.endsWith(":")) {
    return null;
  }

  if (raw.includes(":") && !raw.startsWith("[") && raw !== "::1") {
    return null;
  }

  return isLocalhostHost(raw) ? raw : null;
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }
  if (origin.startsWith("chrome-extension://")) {
    return true;
  }

  const parsed = safeParseUrl(origin);
  if (!parsed) {
    return false;
  }
  return (
    (parsed.protocol === "http:" || parsed.protocol === "https:") &&
    isLocalhostHost(parsed.hostname)
  );
}

function getOriginHost(originHeader) {
  if (!originHeader) {
    return null;
  }
  const originUrl = safeParseUrl(originHeader);
  if (!originUrl) {
    return null;
  }
  return normalizePageHost(originUrl.hostname);
}

function getRequestedPageContext(request, parsedUrl) {
  const pageUrlValue = parsedUrl.searchParams.get("pageUrl");
  const pageUrl =
    pageUrlValue && pageUrlValue.length <= 2048
      ? safeParseUrl(pageUrlValue)
      : null;
  const pageHostFromUrl = pageUrl ? normalizePageHost(pageUrl.hostname) : null;
  const pageHostFromParam = normalizePageHost(
    parsedUrl.searchParams.get("pageHost")
  );
  const pageHostFromOrigin = getOriginHost(
    String(request.headers.origin || "")
  );

  const pageHost = pageHostFromOrigin || pageHostFromParam || pageHostFromUrl;
  return {
    pageHost,
    pageUrl: pageUrl && pageHost ? pageUrl.toString() : null
  };
}

module.exports = {
  getRequestedPageContext,
  isAllowedOrigin,
  normalizePageHost,
  safeParseUrl
};
