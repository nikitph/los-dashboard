import { act, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils/render-helpers";

import GuarantorFormComponent from "@/app/[locale]/saas/(private)/guarantors/components/GuarantorForm";

const GuarantorForm = GuarantorFormComponent as React.ComponentType<any>;

// Mock the required modules
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the toast hook
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// In your test file
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="mock-select">
      <button onClick={() => onValueChange("mock-value")}>Select</button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

// Mock the actions
jest.mock("@/app/[locale]/saas/(private)/guarantors/actions", () => ({
  getLoanApplications: jest.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: "test-loan-id",
        applicant: {
          user: {
            firstName: "John",
            lastName: "Doe",
          },
        },
      },
    ],
  }),
  createGuarantor: jest.fn(),
  updateGuarantor: jest.fn(),
}));

describe("GuarantorForm", () => {
  it("renders the form with basic fields", async () => {
    // Use act to wrap the initial render
    await act(async () => {
      renderWithProviders(<GuarantorForm />);
    });

    // Wait for any async effects to complete
    await waitFor(() => {
      // Your assertions
      expect(screen.getByText("Add New Guarantor")).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Address Information")).toBeInTheDocument();
    });

    // These can be outside waitFor if the above passes
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
