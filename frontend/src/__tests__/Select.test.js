import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Select from "../components/Select";

describe("Select Component", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ];

  test("displays the selected option", () => {
    const handleChange = jest.fn();

    render(
      <Select options={options} value="option2" onChange={handleChange} />
    );

    expect(screen.getByDisplayValue("Option 2")).toBeInTheDocument();
  });

  test("calls onChange when an option is selected", () => {
    const handleChange = jest.fn();

    render(<Select options={options} value="" onChange={handleChange} />);

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "option1" } });

    expect(handleChange).toHaveBeenCalled();
  });
});
