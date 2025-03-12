import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Tabs from "../components/Tabs";
import "@testing-library/jest-dom";


describe("Tabs Component", () => {
  const mockSetTabState = jest.fn();
  const tabsData = [
    { id: 1, name: "Tab 1" },
    { id: 2, name: "Tab 2" },
    { id: 3, name: "Tab 3" },
  ];

  test("renders tabs correctly", () => {
    render(<Tabs data={tabsData} tabState={1} setTabState={mockSetTabState} />);
    
    tabsData.forEach((tab) => {
      expect(screen.getByText(tab.name)).toBeInTheDocument();
    });
  });

  test("sets active tab correctly", () => {
    render(<Tabs data={tabsData} tabState={2} setTabState={mockSetTabState} />);
    
    const activeTab = screen.getByText("Tab 2");
    expect(activeTab).toHaveClass("active");
  });

  test("changes tab on click", () => {
    render(<Tabs data={tabsData} tabState={1} setTabState={mockSetTabState} />);
    
    const tabToClick = screen.getByText("Tab 3");
    fireEvent.click(tabToClick);
    
    expect(mockSetTabState).toHaveBeenCalledWith(3);
  });
});
