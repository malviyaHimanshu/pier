/** @jsxImportSource preact */
import { render } from "preact";
import { App } from "./App";
import type { SharedRuntime } from "./types";

declare global {
  interface Window {
    PierShared?: SharedRuntime;
  }
}

const shared = window.PierShared;
if (!shared) {
  throw new Error(
    "PierShared runtime missing. Ensure extension/shared-runtime.js is loaded first."
  );
}

const root = document.getElementById("app");
if (!root) {
  throw new Error("Missing options app mount node (#app).");
}

render(<App shared={shared} />, root);
