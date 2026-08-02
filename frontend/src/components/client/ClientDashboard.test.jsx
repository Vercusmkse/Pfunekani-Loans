import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientDashboard from "./ClientDashboard";

// Mock the module where useApp is defined
vi.mock("../../context/AppContext", () => ({
  useApp: () => ({
    currentUser: { name: "Test User", tier: "Senior" }, // Provide a mock user object
    loans: [],
    createLoanRequest: vi.fn(() => ({ success: true })),
    payClientInterestOnly: vi.fn(),
  }),
}));

describe("ClientDashboard", () => {
  it("renders the dashboard and allows loan application", () => {
    render(<ClientDashboard />);

    // Check for the main heading
    expect(screen.getByText("Client Workspace")).toBeInTheDocument();

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Requested Capital Sum"), {
      target: { value: "1000" },
    });
    fireEvent.change(
      screen.getByLabelText("Operational Allocation Intention"),
      { target: { value: "Test purpose" } },
    );

    // Submit the form
    fireEvent.click(screen.getByText("Submit Funding Request"));

    // Check for the success message
    expect(
      screen.getByText(/Capital Request for R1000 submitted/),
    ).toBeInTheDocument();
  });
});
