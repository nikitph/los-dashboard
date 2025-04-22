import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { createGuarantor } from "../../actions/createGuarantor";
import { updateGuarantor } from "../../actions/updateGuarantor";
import { GuarantorForm } from "../GuarantorForm/GuarantorForm";

// Mock the actions
vi.mock("../../actions/createGuarantor", () => ({
  createGuarantor: vi.fn(),
}));

vi.mock("../../actions/updateGuarantor", () => ({
  updateGuarantor: vi.fn(),
}));

// Mock the translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the form hooks
vi.mock("@/lib/casl/abilityContext", () => ({
  useAbility: vi.fn(() => ({
    can: vi.fn(() => true),
  })),
}));

// Mock the toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("GuarantorForm", () => {
  const mockLoanApplicationId = "loan123";
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    loanApplicationId: mockLoanApplicationId,
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  const mockGuarantorData = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    mobileNumber: "1234567890",
    addressLine1: "123 Main St",
    addressCity: "New York",
    addressState: "NY",
    addressZipCode: "10001",
    loanApplicationId: mockLoanApplicationId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the create form correctly", () => {
    render(<GuarantorForm {...defaultProps} />);

    expect(screen.getByText("form.createTitle")).toBeInTheDocument();
    expect(screen.getByText("form.createDescription")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "form.create" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "form.cancel" })).toBeInTheDocument();
  });

  it("renders the edit form correctly with initial data", () => {
    render(<GuarantorForm {...defaultProps} initialData={mockGuarantorData} />);

    expect(screen.getByText("form.editTitle")).toBeInTheDocument();
    expect(screen.getByText("form.editDescription")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "form.update" })).toBeInTheDocument();

    // Fields should be pre-filled
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<GuarantorForm {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "form.cancel" });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("submits the form with correct data for create", async () => {
    (createGuarantor as jest.Mock).mockResolvedValue({
      success: true,
      data: mockGuarantorData,
    });

    render(<GuarantorForm {...defaultProps} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("form.firstName.label"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("form.lastName.label"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("form.email.label"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("form.mobileNumber.label"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText("form.addressLine1.label"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText("form.addressCity.label"), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByLabelText("form.addressState.label"), {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getByLabelText("form.addressZipCode.label"), {
      target: { value: "10001" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "form.create" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createGuarantor).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          mobileNumber: "1234567890",
          addressLine1: "123 Main St",
          addressCity: "New York",
          addressState: "NY",
          addressZipCode: "10001",
          loanApplicationId: mockLoanApplicationId,
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockGuarantorData);
    });
  });

  it("submits the form with correct data for update", async () => {
    (updateGuarantor as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockGuarantorData, firstName: "Jane" },
    });

    render(<GuarantorForm {...defaultProps} initialData={mockGuarantorData} />);

    // Update a field
    fireEvent.change(screen.getByLabelText("form.firstName.label"), {
      target: { value: "Jane" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "form.update" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateGuarantor).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          firstName: "Jane",
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("shows error message when submission fails", async () => {
    (createGuarantor as jest.Mock).mockResolvedValue({
      success: false,
      message: "Error creating guarantor",
    });

    render(<GuarantorForm {...defaultProps} />);

    // Fill out minimum required fields
    fireEvent.change(screen.getByLabelText("form.firstName.label"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("form.lastName.label"), {
      target: { value: "Doe" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "form.create" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createGuarantor).toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
