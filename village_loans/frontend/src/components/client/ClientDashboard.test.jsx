import { render, screen, fireEvent } from "@testing-library/react";
import { AppProvider } from "../../context/AppContext";
import ClientDashboard from "./ClientDashboard";

describe("ClientDashboard", () => {
  it("renders the dashboard and allows loan application", () => {
    render(
      <AppProvider>
        <ClientDashboard />
      </AppProvider>,
    );

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
