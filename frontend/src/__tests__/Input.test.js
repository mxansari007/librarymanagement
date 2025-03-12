import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Input from "../components/Input";

describe("Input Component", () => {
    test("renders input with correct placeholder", () => {
        render(<Input name="email" type="text" placeholder="Enter your email" />);
        const inputElement = screen.getByPlaceholderText("Enter your email");
        expect(inputElement).toBeInTheDocument();
    });

    test("renders error message when error prop is provided", () => {
        render(<Input name="email" type="text" error={{ message: "Invalid email" }} />);
        const errorMessage = screen.getByText("*Invalid email");
        expect(errorMessage).toBeInTheDocument();
    });

    test("calls register function if provided", () => {
        const registerMock = jest.fn(() => ({}));
        render(<Input name="email" type="text" register={registerMock} />);
        expect(registerMock).toHaveBeenCalledWith("email", undefined);
    });

    test("accepts and displays defaultValue", () => {
        render(<Input name="email" type="text" defaultValue="test@example.com" />);
        const inputElement = screen.getByDisplayValue("test@example.com");
        expect(inputElement).toBeInTheDocument();
    });

    test("applies error class when error exists", () => {
        render(<Input name="email" type="text" error={{ message: "Error" }} />);
        const inputElement = screen.getByRole("textbox");
        expect(inputElement).toHaveClass("error");
    });
});
