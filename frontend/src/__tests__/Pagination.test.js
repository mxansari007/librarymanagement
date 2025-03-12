import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Pagination from "../components/Pagination";

describe("Pagination Component", () => {
    test("renders pagination buttons and current page", () => {
        render(<Pagination />);
        
        expect(screen.getByText("< Previous")).toBeInTheDocument();
        expect(screen.getByText("Next >")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("previous button is disabled on the first page", () => {
        render(<Pagination />);
        const prevButton = screen.getByText("< Previous");

        expect(prevButton).toBeDisabled();
    });

    test("next button increases the current page", () => {
        render(<Pagination />);
        const nextButton = screen.getByText("Next >");
        
        fireEvent.click(nextButton);
        
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    test("previous button decreases the current page", () => {
        render(<Pagination />);
        const nextButton = screen.getByText("Next >");
        fireEvent.click(nextButton); // Move to page 2

        const prevButton = screen.getByText("< Previous");
        fireEvent.click(prevButton); // Move back to page 1

        expect(screen.getByText("1")).toBeInTheDocument();
    });

    test("previous button is disabled when on the first page after navigating back", () => {
        render(<Pagination />);
        const nextButton = screen.getByText("Next >");
        fireEvent.click(nextButton); // Move to page 2

        const prevButton = screen.getByText("< Previous");
        fireEvent.click(prevButton); // Move back to page 1

        expect(prevButton).toBeDisabled();
    });
});
