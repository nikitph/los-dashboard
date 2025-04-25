// src/jest/mocks.ts
import { PrismaClient } from "@prisma/client";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

// Mock Prisma Client
export const prisma = mockDeep<PrismaClient>();

// Reset all mocks between tests
beforeEach(() => {
  mockReset(prisma);
});

// Mock the Prisma import in all tests
jest.mock("@/lib/prisma/prisma", () => ({
  prisma: prisma,
}));

// Mock server actions with a standard response pattern
export function mockServerAction<T>(value: T, success = true, message = "Success") {
  return jest.fn().mockResolvedValue({
    success,
    message,
    data: value,
  });
}

// Mock error response from server action
export function mockErrorAction(message = "Error", code = "UNKNOWN_ERROR", errors?: Record<string, string>) {
  return jest.fn().mockResolvedValue({
    success: false,
    message,
    code,
    errors,
  });
}

// Get typed mock proxy
export type MockPrisma = DeepMockProxy<PrismaClient>;
