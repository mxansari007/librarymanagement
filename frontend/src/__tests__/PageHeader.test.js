import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PageHeader from "../components/PageHeader";

describe("PageHeader Component", () => {
    beforeEach(() => {
        localStorage.clear(); // Clear localStorage before each test
    });

    test("renders the title correctly", () => {
        render(<PageHeader title="Library Dashboard" />);
        expect(screen.getByText("Library Dashboard")).toBeInTheDocument();
    });

    test("displays library name from localStorage", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ library: { name: "Central Library" } })
        );

        render(<PageHeader title="Library Dashboard" />);
        expect(screen.getByText("Central Library")).toBeInTheDocument();
    });

    test("displays 'No Library' if library name is missing", () => {
        localStorage.setItem("user", JSON.stringify({ library: {} }));

        render(<PageHeader title="Library Dashboard" />);
        expect(screen.getByText("No Library")).toBeInTheDocument();
    });

    test("displays 'No Library' if localStorage is empty", () => {
        render(<PageHeader title="Library Dashboard" />);
        expect(screen.getByText("No Library")).toBeInTheDocument();
    });
});
