import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Table from "../components/Table";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";



const mockData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    image: "base64EncodedImageData"
  }
];

const mockColumns = [
  { header: "Name", key: "name" },
  { header: "Email", key: "email" }
];

const mockButtons = [
  { name: "Edit", onClick: jest.fn() }
];

const mockImageKeys = ["image"];
const mockImageNames = ["Profile Picture"];

const renderTable = (props = {}) => {
  return render(
    <BrowserRouter>
      <Table
        Data={mockData}
        ColumnDef={mockColumns}
        buttons={mockButtons}
        imageKey={mockImageKeys}
        imageName={mockImageNames}
        {...props}
      />
    </BrowserRouter>
  );
};

test("renders table with data", () => {
  renderTable();
  expect(screen.getByText("John Doe")).toBeInTheDocument();
  expect(screen.getByText("john@example.com")).toBeInTheDocument();
  expect(screen.getByText("Profile Picture")).toBeInTheDocument();
});

test("renders table headers", () => {
  renderTable();
  expect(screen.getByText("Name")).toBeInTheDocument();
  expect(screen.getByText("Email")).toBeInTheDocument();
});

test("calls button click handler", () => {
  renderTable();
  const editButton = screen.getByText("Edit");
  fireEvent.click(editButton);
  expect(mockButtons[0].onClick).toHaveBeenCalledWith(mockData[0]);
});

test("opens and closes image modal", async () => {
  renderTable();

  const image = screen.getByAltText("Profile Picture");
  fireEvent.click(image);
  
  await waitFor(() => expect(screen.getByAltText("Preview")).toBeInTheDocument());

  const closeButton = screen.getByText("×");
  fireEvent.click(closeButton);

  await waitFor(() => expect(screen.queryByAltText("Preview")).not.toBeInTheDocument());
});

test("displays no data message when no records are present", () => {
  renderTable({ Data: [] });
  expect(screen.getByText("No data available")).toBeInTheDocument();
});
