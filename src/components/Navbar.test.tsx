import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getPanel = () => {
  const btn = screen.getByLabelText("Toggle menu");
  const panel = btn.parentElement?.querySelector<HTMLElement>(".absolute.top-full");
  if (!panel) throw new Error("menu panel not found");
  return panel;
};

const opacity = (el: HTMLElement) => parseFloat(getComputedStyle(el).opacity);

const mockRect = (el: Element, r: Partial<DOMRect>) => {
  el.getBoundingClientRect = () =>
    ({ x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => {}, ...r }) as DOMRect;
};

describe("Navbar dropdown spring", () => {
  it("FLIPs out of the hamburger and animates open over time", async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const btn = screen.getByLabelText("Toggle menu");
    const panel = getPanel();

    // jsdom has no layout — simulate button and panel rects
    mockRect(btn, { width: 36, height: 36, left: 264, right: 300, top: 10, bottom: 46 });
    mockRect(panel, { width: 200, height: 150, left: 100, right: 300, top: 54, bottom: 204 });

    expect(opacity(panel)).toBe(0);

    fireEvent.click(btn);

    // FLIP start: panel is squeezed onto the button (y offset = 10 - 54 = -44)
    expect(panel.style.transform).toContain("-44");

    // Mid-flight: 400ms open means still partly transparent at ~80ms
    await sleep(80);
    const mid = opacity(panel);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(0.99);

    await waitFor(() => expect(opacity(panel)).toBeGreaterThanOrEqual(0.99), {
      timeout: 2000,
    });
    expect(getComputedStyle(panel).visibility).toBe("visible");
    expect(panel.style.transform).not.toContain("-44");

    // Button icon is gone — the panel took its place
    await waitFor(() => expect(opacity(btn)).toBeLessThan(0.01), { timeout: 1000 });
  });

  it("springs back into the hamburger and ends hidden", async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText("Toggle menu"));
    await waitFor(() => expect(opacity(getPanel())).toBeGreaterThanOrEqual(0.99), {
      timeout: 2000,
    });

    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // 300ms close — still mid-animation at 60ms, not snapped shut
    await sleep(60);
    expect(getComputedStyle(getPanel()).visibility).toBe("visible");

    await waitFor(() => expect(getComputedStyle(getPanel()).visibility).toBe("hidden"), {
      timeout: 2000,
    });

    // Icon returns when the panel has fully retracted
    await waitFor(() => expect(opacity(screen.getByLabelText("Toggle menu"))).toBeGreaterThanOrEqual(0.99), {
      timeout: 1000,
    });
  });
});
