import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../components/Modal";

describe("Modal Component", () => {
    let setModalStateMock;

    beforeEach(() => {
        setModalStateMock = jest.fn();
    });

    test("renders the modal with label and children", () => {
        render(
            <Modal label="Test Modal" modalState={true} setModalState={setModalStateMock}>
                <p>Modal Content</p>
            </Modal>
        );

        expect(screen.getByText("Test Modal")).toBeInTheDocument();
        expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    test("calls setModalState(false) when close button is clicked", () => {
        render(
            <Modal label="Test Modal" modalState={true} setModalState={setModalStateMock}>
                <p>Modal Content</p>
            </Modal>
        );

        const closeButton = screen.getByRole("button", { name: "Close modal" });
        fireEvent.click(closeButton);

        expect(setModalStateMock).toHaveBeenCalledWith(false);
    });

    test("calls setModalState(false) when clicking outside the modal (overlay click)", () => {
        render(
            <Modal label="Test Modal" modalState={true} setModalState={setModalStateMock}>
                <p>Modal Content</p>
            </Modal>
        );

        const overlay = screen.getByTestId("modal-overlay");
        fireEvent.click(overlay);

        expect(setModalStateMock).toHaveBeenCalledWith(false);
    });

    test("calls setModalState(false) when Escape key is pressed", () => {
        render(
            <Modal label="Test Modal" modalState={true} setModalState={setModalStateMock}>
                <p>Modal Content</p>
            </Modal>
        );

        fireEvent.keyDown(document, { key: "Escape" });

        expect(setModalStateMock).toHaveBeenCalledWith(false);
    });

    test("prevents background scrolling when modal is open", () => {
        render(
            <Modal label="Test Modal" modalState={true} setModalState={setModalStateMock}>
                <p>Modal Content</p>
            </Modal>
        );

        expect(document.body.style.overflow).toBe("hidden");
    });

    test("restores background scrolling when modal is closed", () => {
        const { unmount } = render(
            <Modal label="Test Modal" modalState={true} setModalState={setModalStateMock}>
                <p>Modal Content</p>
            </Modal>
        );

        unmount(); // Unmount the component
        expect(document.body.style.overflow).toBe("auto");
    });
});
