import type { SharedRuntime } from "./types";

export function generateToken(shared: SharedRuntime) {
  return shared.randomHexToken(48);
}
