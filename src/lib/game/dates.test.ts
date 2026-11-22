import { describe, expect, it } from "vitest";
import { formatLifeMonth } from "./dates";

describe("elu kuupäevad", () => {
  it("valitud alguskuupäev ja aastaüle liikumine on õiged", () => {
    expect(formatLifeMonth("2026-03-15", 0)).toBe("märts 2026");
    expect(formatLifeMonth("2026-11-01", 2)).toBe("jaanuar 2027");
  });
  it("31. jaanuarist edasi liikudes ei jää veebruar vahele", () => {
    expect(formatLifeMonth("2026-01-31", 1)).toBe("veebruar 2026");
    expect(formatLifeMonth("2026-01-31", 2)).toBe("märts 2026");
  });
});
