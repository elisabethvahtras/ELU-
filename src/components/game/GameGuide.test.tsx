import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameGuide } from "./GameGuide";

afterEach(() => { cleanup(); localStorage.clear(); });

describe("Kiirjuhendi tegevused", () => {
  it("avab rahaseisu ja ostukoti ilma mängija andmeid muutmata", () => {
    const onOpen = vi.fn();
    localStorage.setItem("elu-plus-v1", "existing-player-save");
    render(<GameGuide open onClose={() => {}} onOpen={onOpen} hasLife />);
    fireEvent.click(screen.getByRole("button", { name: "Vaata sissetulekuid ja kulusid" }));
    expect(onOpen).toHaveBeenLastCalledWith("finances");
    fireEvent.click(screen.getByRole("button", { name: "Järgmine" }));
    fireEvent.click(screen.getByRole("button", { name: "Ava ostukott" }));
    expect(onOpen).toHaveBeenLastCalledWith("bag");
    expect(localStorage.getItem("elu-plus-v1")).toBe("existing-player-save");
  });

  it("jätkab sama sammu pärast juhendi sulgemist ja taasavamist", () => {
    const onOpen = vi.fn();
    const props = { onClose: () => {}, onOpen, hasLife: true };
    const { rerender } = render(<GameGuide {...props} open />);
    fireEvent.click(screen.getByRole("button", { name: "Järgmine" }));
    fireEvent.click(screen.getByRole("button", { name: "Järgmine" }));
    rerender(<GameGuide {...props} open={false} />);
    rerender(<GameGuide {...props} open />);
    fireEvent.click(screen.getByRole("button", { name: "Vaata õpinguid" }));
    expect(onOpen).toHaveBeenCalledExactlyOnceWith("household");
  });

  it("sulgub Escape-klahviga", () => {
    const onClose = vi.fn();
    render(<GameGuide open onClose={onClose} onOpen={() => {}} hasLife />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});