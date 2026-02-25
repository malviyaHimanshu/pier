import { h } from "preact";
import { render, screen } from "@testing-library/preact";
import { PanelShell } from "../../packages/extension-src/src/content/PanelShell";

describe("PanelShell", () => {
  it("renders terminal panel controls and mount container", () => {
    render(h(PanelShell, {}));

    expect(screen.getByRole("separator", { hidden: true })).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Close terminal panel",
        hidden: true
      })
    ).toBeTruthy();
    expect(screen.queryByText("Browser Terminal")).toBeNull();
    expect(screen.queryByText(/\(idle\)/i)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Reconnect", hidden: true })
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Clear", hidden: true })
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Settings", hidden: true })
    ).toBeNull();
    expect(document.getElementById("pier-terminal")).toBeTruthy();
  });
});
