import { deleteApplicant, getApplicantById, getApplicants, getStates } from "../actions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    applicant: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Example valid applicant data for testing
const validApplicantData = {
  userId: "user-123",
  dateOfBirth: new Date("1990-01-01"),
  addressState: "California",
  addressCity: "San Francisco",
  addressFull: "123 Main St",
  addressPinCode: "94101",
  aadharNumber: "1234-5678-9012",
  panNumber: "ABCDE1234F",
  aadharVerificationStatus: true,
  panVerificationStatus: false,
  photoUrl: "https://example.com/photo.jpg",
};

describe("Applicant Server Actions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("getApplicants", () => {
    it("should retrieve all applicants when no filters are provided", async () => {
      // Mock data
      const mockApplicants = [
        { id: "1", ...validApplicantData },
        { id: "2", ...validApplicantData, addressState: "New York" },
      ];

      // Mock Prisma findMany to return the mock data
      (prisma.applicant.findMany as jest.Mock).mockResolvedValue(mockApplicants);

      // Call the function with no params (defaults)
      const result = await getApplicants();

      // Assert Prisma was called with the right params
      expect(prisma.applicant.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      });

      // Assert the result
      expect(result).toEqual({
        success: true,
        data: mockApplicants,
      });
    });

    it("should apply state filtering when specified", async () => {
      // Mock data
      const mockApplicants = [{ id: "1", ...validApplicantData, addressState: "California" }];

      // Mock Prisma findMany to return the mock data
      (prisma.applicant.findMany as jest.Mock).mockResolvedValue(mockApplicants);

      // Call the function with state filter
      const result = await getApplicants("", "California");

      // Assert Prisma was called with the right params
      expect(prisma.applicant.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          addressState: "California",
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      });

      // Assert the result
      expect(result).toEqual({
        success: true,
        data: mockApplicants,
      });
    });

    it("should apply search filtering correctly", async () => {
      // Mock data - this would normally be filtered by the database,
      // but since we're mocking, we handle filtering in the test
      const mockApplicants = [
        {
          id: "1",
          ...validApplicantData,
          addressCity: "San Francisco",
          user: {
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
          },
        },
        {
          id: "2",
          ...validApplicantData,
          addressCity: "Los Angeles",
          user: {
            email: "other@example.com",
            firstName: "Jane",
            lastName: "Smith",
            phoneNumber: "9876543210",
          },
        },
      ];

      // Mock Prisma findMany to return the mock data
      (prisma.applicant.findMany as jest.Mock).mockResolvedValue(mockApplicants);

      // Call the function with search term
      const result = await getApplicants("san");

      // Assert the result is filtered correctly
      expect(result.success).toBe(true);
      expect(result?.data?.length).toBe(1);
      // @ts-ignore
      expect(result?.data[0]?.id).toBe("1");
    });
  });

  describe("getApplicantById", () => {
    it("should retrieve a single applicant by ID", async () => {
      // Mock data
      const mockApplicant = {
        id: "abc123",
        ...validApplicantData,
        loanApplications: [],
      };

      // Mock Prisma findUnique
      (prisma.applicant.findUnique as jest.Mock).mockResolvedValue(mockApplicant);

      // Call the function
      const result = await getApplicantById("abc123");

      // Assert Prisma was called correctly
      expect(prisma.applicant.findUnique).toHaveBeenCalledWith({
        where: { id: "abc123", deletedAt: null },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          loanApplications: true,
        },
      });

      // Assert the result
      expect(result).toEqual({
        success: true,
        data: mockApplicant,
      });
    });

    it("should return error when applicant is not found", async () => {
      // Mock Prisma to return null (applicant not found)
      (prisma.applicant.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      const result = await getApplicantById("not-found-id");

      // Assert the result
      expect(result).toEqual({
        success: false,
        message: "Applicant not found",
      });
    });
  });

  describe("deleteApplicant", () => {
    it("should soft delete an applicant", async () => {
      // Mock existing applicant
      const existingApplicant = { id: "abc123", ...validApplicantData };
      (prisma.applicant.findUnique as jest.Mock).mockResolvedValue(existingApplicant);

      // Mock Prisma update
      (prisma.applicant.update as jest.Mock).mockResolvedValue({
        ...existingApplicant,
        deletedAt: new Date(),
      });

      // Call the function
      const result = await deleteApplicant("abc123");

      // Assert Prisma was called correctly
      expect(prisma.applicant.update).toHaveBeenCalledWith({
        where: { id: "abc123" },
        data: {
          deletedAt: expect.any(Date),
        },
      });

      // Assert revalidatePath was called
      expect(revalidatePath).toHaveBeenCalledWith("/saas/applicants/list");

      // Assert the result
      expect(result).toEqual({
        success: true,
        message: "Applicant deleted successfully",
      });
    });

    it("should handle non-existent applicant", async () => {
      // Mock Prisma to return null (applicant not found)
      (prisma.applicant.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      const result = await deleteApplicant("not-found-id");

      // Assert the result
      expect(result).toEqual({
        success: false,
        message: "Applicant not found",
      });

      // Assert Prisma update was not called
      expect(prisma.applicant.update).not.toHaveBeenCalled();
    });
  });

  describe("getStates", () => {
    it("should return all unique states", async () => {
      // Mock Prisma response
      const mockStates = [{ addressState: "California" }, { addressState: "New York" }, { addressState: "Texas" }];
      (prisma.applicant.findMany as jest.Mock).mockResolvedValue(mockStates);

      // Call the function
      const result = await getStates();

      // Assert Prisma was called correctly
      expect(prisma.applicant.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: { addressState: true },
        distinct: ["addressState"],
      });

      // Assert the result
      expect(result).toEqual({
        success: true,
        data: ["California", "New York", "Texas"],
      });
    });

    it("should handle database errors", async () => {
      // Mock Prisma to throw an error
      (prisma.applicant.findMany as jest.Mock).mockRejectedValue(new Error("Database error"));

      // Call the function
      const result = await getStates();

      // Assert error handling
      expect(result).toEqual({
        success: false,
        message: "Failed to retrieve states",
        error: "Database error",
      });
    });
  });
});
