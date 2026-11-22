import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { CreateLife } from "./CreateLife";
import { NumField } from "./ui";

describe("Number fields", () => {
  it("keeps the income field focused while a multi-digit number is entered", () => {
    render(<CreateLife />);
    fireEvent.click(screen.getByRole("button", { name: /Kohanda algseisu/ }));

    const initial = screen.getByLabelText("Netosissetulek kuus");
    initial.focus();
    fireEvent.change(initial, { target: { value: "2" } });

    const afterFirstDigit = screen.getByLabelText("Netosissetulek kuus");
    expect(afterFirstDigit).toHaveFocus();
    expect(afterFirstDigit).toHaveValue("2");

    fireEvent.change(afterFirstDigit, { target: { value: "25" } });
    fireEvent.change(afterFirstDigit, { target: { value: "250" } });
    fireEvent.change(afterFirstDigit, { target: { value: "2500" } });
    expect(screen.getByLabelText("Netosissetulek kuus")).toHaveValue("2500");
  });

  it("does not replace a clamped value until the user leaves the field", () => {
    function ClampedField() {
      const [value, setValue] = useState(0);
      return <NumField label="Üüritulu kuus" value={value} onChange={setValue} clamp={(n) => Math.min(135, n)} />;
    }

    render(<ClampedField />);
    const field = screen.getByLabelText("Üüritulu kuus");
    field.focus();
    fireEvent.change(field, { target: { value: "9000" } });
    expect(field).toHaveValue("9000");

    fireEvent.blur(field);
    expect(screen.getByLabelText("Üüritulu kuus")).toHaveValue("135");
  });
});
