import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import AdminDashboard from "./AdminDashboard";

// Mock handler functions
const mockApproveLoan = vi.fn();
const mockClearLoanAsPaid = vi.fn();
const mockExtendLoanDuration30Days = vi.fn();
const mockSendProximityReminderMessage = vi.fn();

// Precise mock data matching the exact properties used in AdminDashboard.jsx
vi.mock("../../context/AppContext", () => ({
  useApp: () => ({
    loans: [
      {
        id: "1",
        borrowerName: "cust1", // Correct property for the customer name
        borrowerTier: "Tier 1",
        amount: 1000,
        totalRepayable: 1400, // Correct property for maturity target
        interest: 400,
        interestPaid: 0,
        status: "Pending Approval", // Correct status to make the button appear
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        dateApplied: new Date().toISOString(),
      },
      {
        id: "2",
        borrowerName: "cust2",
        borrowerTier: "Tier 2",
        amount: 2000,
        totalRepayable: 2800,
        interest: 800,
        interestPaid: 800,
        status: "Active",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        dateApplied: new Date().toISOString(),
      },
    ],
    approveLoan: mockApproveLoan,
    clearLoanAsPaid: mockClearLoanAsPaid,
    extendLoanDuration30Days: mockExtendLoanDuration30Days,
    sendProximityReminderMessage: mockSendProximityReminderMessage,
  }),
}));

describe("AdminDashboard", () => {
  it("fetches and displays loans", async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    // Assert that the customer names are now correctly rendered
    expect(await screen.findByText("cust1")).toBeInTheDocument();
    expect(screen.getByText("cust2")).toBeInTheDocument();
  });

  it("calls approveLoan when approve button is clicked", () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>,
    );

    // Use the robust getByRole query, which will now find the button
    const approveButton = screen.getByRole("button", {
      name: /Approve & Fire WhatsApp/i,
    });
    fireEvent.click(approveButton);

    expect(mockApproveLoan).toHaveBeenCalledWith("1");
  });
});
