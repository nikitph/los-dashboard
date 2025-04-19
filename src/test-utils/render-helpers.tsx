import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { User } from "@/types/globalTypes";
import { AbilityProvider } from "@/lib/casl/abilityContext";
import { AppAbility } from "@/lib/casl/types";
// Import after mocking
import { useUser } from "@/contexts/userContext";

// Mock the userContext module
jest.mock("@/contexts/userContext", () => ({
  useUser: jest.fn(),
}));

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  user?: User;
  ability?: AppAbility;
  locale?: "en" | "hi";
}

/**
 * Custom render with providers for testing components
 *
 * @param ui - Component to render
 * @param options - Render options including user and locale
 * @returns The rendered component with testing utilities
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    user = {
      id: "test-user",
      roles: [{ role: "BANK_ADMIN", bankId: "test-bank-id" }],
      currentRole: { role: "BANK_ADMIN", bankId: "test-bank-id" },
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
    } as User,
    locale = "en",
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  // Mock the useUser hook to return our test user
  const mockUseUser = useUser as jest.Mock;
  mockUseUser.mockReturnValue({ user, isLoading: false });

  function Wrapper({ children }: { children: ReactNode }) {
    return <AbilityProvider>{children}</AbilityProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock translations object for testing
 * Returns the key as the translation value
 */
export const mockTranslations = (prefix: string = "") => {
  return (key: string) => (prefix ? `${prefix}.${key}` : key);
};
