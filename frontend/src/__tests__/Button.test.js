import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../components/Button"; // Adjust path if needed
import "@testing-library/jest-dom";


describe("Button Component", () => {
    test("renders the button with children text", () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    test("calls onClick function when clicked", () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);

        const button = screen.getByText("Click Me");
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("disables the button when disabled prop is true", () => {
        render(<Button disabled>Disabled</Button>);

        const button = screen.getByText("Disabled");
        expect(button).toBeDisabled();
    });

    test("applies primary-loading class when variant is 'primary-loading' and loading is true", () => {
        const { container } = render(<Button variant="primary-loading" loading>Loading</Button>);
        expect(container.querySelector("div")).toHaveClass("primary_loading");
    });

    test("applies secondary variant styles correctly", () => {
        const { container } = render(<Button variant="secondary">Secondary</Button>);
        expect(container.querySelector("button")).toHaveClass("secondary_button");
    });

    test("applies disabled styles correctly for secondary variant", () => {
        const { container } = render(<Button variant="secondary" disabled>Disabled</Button>);
        expect(container.querySelector("button")).toHaveClass("primary_button_disabled");
    });
});
