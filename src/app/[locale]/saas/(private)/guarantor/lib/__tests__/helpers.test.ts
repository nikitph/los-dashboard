import { formatFullAddress, formatFullName, transformToGuarantorView } from "../helpers";

describe("Guarantor Helpers", () => {
  describe("formatFullName", () => {
    it("combines first and last name correctly", () => {
      expect(formatFullName("John", "Doe")).toBe("John Doe");
    });

    it("handles empty first name", () => {
      expect(formatFullName("", "Doe")).toBe("Doe");
    });

    it("handles empty last name", () => {
      expect(formatFullName("John", "")).toBe("John");
    });

    it("trims whitespace", () => {
      expect(formatFullName("John ", " Doe")).toBe("John Doe");
    });
  });

  describe("formatFullAddress", () => {
    it("formats address correctly with all fields", () => {
      const address = {
        addressLine1: "123 Main St",
        addressLine2: "Apt 4B",
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10001",
      };

      expect(formatFullAddress(address)).toBe("123 Main St, Apt 4B, New York, NY 10001");
    });

    it("handles missing address line 2", () => {
      const address = {
        addressLine1: "123 Main St",
        addressLine2: null,
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10001",
      };

      expect(formatFullAddress(address)).toBe("123 Main St, New York, NY 10001");
    });

    it("handles empty address line 2", () => {
      const address = {
        addressLine1: "123 Main St",
        addressLine2: "",
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10001",
      };

      expect(formatFullAddress(address)).toBe("123 Main St, New York, NY 10001");
    });
  });

  describe("transformToGuarantorView", () => {
    it("adds derived fields to guarantor data", () => {
      const guarantorData = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        addressLine1: "123 Main St",
        addressLine2: null,
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10001",
        mobileNumber: "1234567890",
        loanApplicationId: "loan123",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        deletedAt: null,
      };

      const transformed = transformToGuarantorView(guarantorData);

      expect(transformed).toEqual({
        ...guarantorData,
        fullName: "John Doe",
        fullAddress: "123 Main St, New York, NY 10001",
      });
    });

    it("preserves all original data fields", () => {
      const guarantorData = {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        addressLine1: "123 Main St",
        addressLine2: "Apt 4B",
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10001",
        mobileNumber: "1234567890",
        loanApplicationId: "loan123",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        deletedAt: null,
      };

      const transformed = transformToGuarantorView(guarantorData);

      expect(transformed.id).toBe("1");
      expect(transformed.firstName).toBe("John");
      expect(transformed.lastName).toBe("Doe");
      expect(transformed.email).toBe("john@example.com");
      expect(transformed.addressLine1).toBe("123 Main St");
      expect(transformed.addressLine2).toBe("Apt 4B");
      expect(transformed.addressCity).toBe("New York");
      expect(transformed.addressState).toBe("NY");
      expect(transformed.addressZipCode).toBe("10001");
      expect(transformed.mobileNumber).toBe("1234567890");
      expect(transformed.loanApplicationId).toBe("loan123");
      expect(transformed.createdAt).toEqual(new Date("2023-01-01"));
      expect(transformed.updatedAt).toEqual(new Date("2023-01-02"));
      expect(transformed.deletedAt).toBeNull();

      // Check that it added the derived fields
      expect(transformed.fullName).toBe("John Doe");
      expect(transformed.fullAddress).toBe("123 Main St, Apt 4B, New York, NY 10001");
    });
  });
});
