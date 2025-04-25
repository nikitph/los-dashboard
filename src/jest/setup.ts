import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => "",
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
  }),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  getTranslations: () => Promise.resolve((key: string) => key),
}));

// Mock server actions by default
jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  revalidatePath: jest.fn(),
}));

// Set up global variables used in tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
