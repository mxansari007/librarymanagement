import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { BrowserRouter } from "react-router-dom";

test("toggles mobile sidebar visibility", async () => {
  render(
    <BrowserRouter>
      <Sidebar Options={[]} User={{ firstName: "John" }} logout={jest.fn()} />
    </BrowserRouter>
  );

  const hamburgerButton = screen.getByRole("button");
  const sidebar = screen.getByTestId("sidebar"); // Correct way to select sidebar

  // Ensure sidebar starts hidden
  expect(sidebar.classList.contains("open")).toBe(false);

  // Click hamburger to open sidebar
  fireEvent.click(hamburgerButton);
  await waitFor(() => {
    expect(sidebar.classList.contains("open")).toBe(true);
  });

  // Click again to close sidebar
  fireEvent.click(hamburgerButton);
  await waitFor(() => {
    expect(sidebar.classList.contains("open")).toBe(false);
  });
});
