import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuidedDemo } from "./GuidedDemo";

afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); });

describe("Demo juhtimine", () => {
  it("jõuab automaatselt 120 sekundini, peatub ja jätab salvestuse muutmata", () => {
    vi.useFakeTimers();
    localStorage.setItem("elu-plus-v1", "existing-player-save");
    render(<GuidedDemo onExit={() => {}} />);
    act(() => vi.advanceTimersByTime(120000));
    expect(Number(screen.getByRole("progressbar").getAttribute("value"))).toBe(120);
    act(() => vi.advanceTimersByTime(10000));
    expect(Number(screen.getByRole("progressbar").getAttribute("value"))).toBe(120);
    expect(localStorage.getItem("elu-plus-v1")).toBe("existing-player-save");
    expect(vi.getTimerCount()).toBe(0);
  });
  it("peatab küsimuste ajaks kella ja jätkab samast hetkest", () => {
    vi.useFakeTimers();
    render(<GuidedDemo onExit={() => {}} />);
    act(() => vi.advanceTimersByTime(18000));
    fireEvent.click(screen.getByRole("button", { name: "Peata demo" }));
    act(() => vi.advanceTimersByTime(20000));
    expect(Number(screen.getByRole("progressbar").getAttribute("value"))).toBe(18);
    fireEvent.click(screen.getByRole("button", { name: "Jätka demo" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(Number(screen.getByRole("progressbar").getAttribute("value"))).toBe(20);
  });
  it("lubab kohe väljuda nupuga või Escape-klahviga ja eemaldab taimeri", () => {
    vi.useFakeTimers();
    const onExit = vi.fn();
    const view = render(<GuidedDemo onExit={onExit} />);
    fireEvent.click(screen.getByRole("button", { name: "Lõpeta demo" }));
    expect(onExit).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onExit).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("ostukorvi proovimine peatab demo ega muuda mängija salvestust", () => {
    vi.useFakeTimers();
    localStorage.setItem("elu-plus-v1", "existing-player-save");
    render(<GuidedDemo onExit={() => {}} />);
    act(() => vi.advanceTimersByTime(24000));
    fireEvent.change(screen.getAllByRole("textbox", { name: "Kogus" })[0] ?? screen.getByRole("textbox"), { target: { value: "2" } });
    act(() => vi.advanceTimersByTime(12000));
    expect(Number(screen.getByRole("progressbar").getAttribute("value"))).toBe(24);
    expect(localStorage.getItem("elu-plus-v1")).toBe("existing-player-save");
  });
});