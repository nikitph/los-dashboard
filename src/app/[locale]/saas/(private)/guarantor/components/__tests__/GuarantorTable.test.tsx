import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { deleteGuarantor } from "../../actions/deleteGuarantor";
import { GuarantorTable } from "../GuarantorTable";

// Mock the actions
jest.mock("../../actions/deleteGuarantor", () => ({
  deleteGuarantor: jest.fn(),
}));

// Mock the translations
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock hooks
jest.mock("@/lib/casl/abilityContext", () => ({
  useAbility: jest.fn(() => ({
    can: jest.fn(() => true),
  })),
}));

describe("GuarantorTable", () => {
  const mockData = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      mobileNumber: "1234567890",
      addressLine1: "123 Main St",
      addressCity: "New York",
      addressState: "NY",
      addressZipCode: "10001",
      loanApplicationId: "loan123",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      fullName: "John Doe",
      fullAddress: "123 Main St, New York, NY 10001",
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      mobileNumber: "0987654321",
      addressLine1: "456 Broadway",
      addressCity: "Los Angeles",
      addressState: "CA",
      addressZipCode: "90001",
      loanApplicationId: "loan456",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      fullName: "Jane Smith",
      fullAddress: "456 Broadway, Los Angeles, CA 90001",
    },
  ];

  const defaultProps = {
    initialData: mockData,
    allowActions: true,
    onDataChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the table with data", () => {
    render(<GuarantorTable {...defaultProps} />);

    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("list.search")).toBeInTheDocument();

    // Check if data is rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("filters data when searching", async () => {
    render(<GuarantorTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("list.search");
    fireEvent.change(searchInput, { target: { value: "john" } });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  it("handles delete confirmation", async () => {
    (deleteGuarantor as jest.Mock).mockResolvedValue({ success: true });

    render(<GuarantorTable {...defaultProps} />);

    // Click on the more options menu
    const moreButtons = screen.getAllByRole("button", { name: "list.actions" });
    fireEvent.click(moreButtons[0]);

    // Click delete option
    const deleteButton = screen.getByText("list.delete");
    fireEvent.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByText("list.confirmDelete");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteGuarantor).toHaveBeenCalledWith({ id: "1" });
      expect(defaultProps.onDataChange).toHaveBeenCalled();
    });
  });

  it("cancels delete when cancel is clicked", async () => {
    render(<GuarantorTable {...defaultProps} />);

    // Click on the more options menu
    const moreButtons = screen.getAllByRole("button", { name: "list.actions" });
    fireEvent.click(moreButtons[0]);

    // Click delete option
    const deleteButton = screen.getByText("list.delete");
    fireEvent.click(deleteButton);

    // Click cancel
    const cancelButton = screen.getByText("list.cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(deleteGuarantor).not.toHaveBeenCalled();
      expect(screen.queryByText("list.confirmDelete")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no data", () => {
    render(<GuarantorTable initialData={[]} allowActions={true} onDataChange={jest.fn()} />);

    expect(screen.getByText("list.noResults")).toBeInTheDocument();
  });
});
