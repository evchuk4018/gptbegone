import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App routes", () => {
  it("renders module links on root route", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Open AI Chat");
    expect(html).toContain("Open Money Tracker");
    expect(html).toContain("Open Workout Tracker");
  });

  it("renders chat route shell", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/ai"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Claude");
  });

  it("renders money route shell", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/money"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Money Command");
  });

  it("renders workout route shell", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/workout"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Training Ledger");
  });
});
