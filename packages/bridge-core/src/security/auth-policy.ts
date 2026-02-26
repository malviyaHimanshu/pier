function toBool(value, fallback = false) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) {
    return fallback;
  }
  if (["1", "true", "yes", "on"].includes(raw)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(raw)) {
    return false;
  }
  return fallback;
}

function evaluateTokenAuth({
  incomingToken,
  configuredToken,
  strictToken = false
}: {
  incomingToken: string;
  configuredToken: string;
  strictToken?: boolean;
}) {
  const value = String(incomingToken || "");
  const expected = String(configuredToken || "");
  const strict = Boolean(strictToken);

  if (value && value === expected) {
    return { ok: true, mode: "configured" };
  }

  if (!strict && value === "change-me") {
    return { ok: true, mode: "legacy-default" };
  }

  return { ok: false, mode: "rejected" };
}

module.exports = {
  evaluateTokenAuth,
  toBool
};

export {};
