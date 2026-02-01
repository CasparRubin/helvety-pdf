import { describe, it, expect } from "vitest";

import {
  validateNonNegativeInteger,
  validateArray,
  validateFiniteNumber,
  generateUniqueFileName,
} from "@/lib/validation-utils";

describe("validation-utils", () => {
  describe("validateNonNegativeInteger", () => {
    it("should pass for zero", () => {
      expect(() => validateNonNegativeInteger(0, "test")).not.toThrow();
    });

    it("should pass for positive integers", () => {
      expect(() => validateNonNegativeInteger(1, "test")).not.toThrow();
      expect(() => validateNonNegativeInteger(100, "test")).not.toThrow();
    });

    it("should throw for negative numbers", () => {
      expect(() => validateNonNegativeInteger(-1, "test")).toThrow(
        "Invalid test: -1"
      );
    });

    it("should throw for floating point numbers", () => {
      expect(() => validateNonNegativeInteger(1.5, "test")).toThrow(
        "Invalid test: 1.5"
      );
    });

    it("should throw for non-numbers", () => {
      expect(() => validateNonNegativeInteger("1", "test")).toThrow();
      expect(() => validateNonNegativeInteger(null, "test")).toThrow();
      expect(() => validateNonNegativeInteger(undefined, "test")).toThrow();
    });

    it("should throw for NaN", () => {
      expect(() => validateNonNegativeInteger(NaN, "test")).toThrow();
    });

    it("should throw for Infinity", () => {
      expect(() => validateNonNegativeInteger(Infinity, "test")).toThrow();
    });
  });

  describe("validateArray", () => {
    it("should pass for arrays", () => {
      expect(() => validateArray([], "test")).not.toThrow();
      expect(() => validateArray([1, 2, 3], "test")).not.toThrow();
      expect(() => validateArray(["a", "b"], "test")).not.toThrow();
    });

    it("should throw for non-arrays", () => {
      expect(() => validateArray({}, "test")).toThrow("Expected an array");
      expect(() => validateArray("test", "test")).toThrow("Expected an array");
      expect(() => validateArray(123, "test")).toThrow("Expected an array");
      expect(() => validateArray(null, "test")).toThrow("Expected an array");
      expect(() => validateArray(undefined, "test")).toThrow(
        "Expected an array"
      );
    });
  });

  describe("validateFiniteNumber", () => {
    it("should pass for finite numbers", () => {
      expect(() => validateFiniteNumber(0, "test")).not.toThrow();
      expect(() => validateFiniteNumber(1.5, "test")).not.toThrow();
      expect(() => validateFiniteNumber(-100, "test")).not.toThrow();
    });

    it("should throw for Infinity", () => {
      expect(() => validateFiniteNumber(Infinity, "test")).toThrow(
        "Must be a finite number"
      );
      expect(() => validateFiniteNumber(-Infinity, "test")).toThrow(
        "Must be a finite number"
      );
    });

    it("should throw for NaN", () => {
      expect(() => validateFiniteNumber(NaN, "test")).toThrow(
        "Must be a finite number"
      );
    });

    it("should throw for non-numbers", () => {
      expect(() => validateFiniteNumber("1", "test")).toThrow();
      expect(() => validateFiniteNumber(null, "test")).toThrow();
    });
  });

  describe("generateUniqueFileName", () => {
    const createMockPdfFile = (name: string) => ({
      id: Math.random().toString(),
      file: { name, size: 1000 } as File,
      url: "blob:test",
      pageCount: 1,
      color: "#000000",
      type: "pdf" as const,
    });

    it("should return original name if no conflicts", () => {
      const existingFiles = [createMockPdfFile("other.pdf")];
      expect(generateUniqueFileName("test.pdf", existingFiles)).toBe("test.pdf");
    });

    it("should add _2 suffix for first conflict", () => {
      const existingFiles = [createMockPdfFile("test.pdf")];
      expect(generateUniqueFileName("test.pdf", existingFiles)).toBe(
        "test_2.pdf"
      );
    });

    it("should increment suffix for multiple conflicts", () => {
      const existingFiles = [
        createMockPdfFile("test.pdf"),
        createMockPdfFile("test_2.pdf"),
        createMockPdfFile("test_3.pdf"),
      ];
      expect(generateUniqueFileName("test.pdf", existingFiles)).toBe(
        "test_4.pdf"
      );
    });

    it("should handle files without extensions", () => {
      const existingFiles = [createMockPdfFile("readme")];
      expect(generateUniqueFileName("readme", existingFiles)).toBe("readme_2");
    });

    it("should handle empty existing files", () => {
      expect(generateUniqueFileName("test.pdf", [])).toBe("test.pdf");
    });

    it("should consider usedNames set", () => {
      const existingFiles: ReturnType<typeof createMockPdfFile>[] = [];
      const usedNames = new Set(["test.pdf", "test_2.pdf"]);
      expect(generateUniqueFileName("test.pdf", existingFiles, usedNames)).toBe(
        "test_3.pdf"
      );
    });

    it("should handle files with multiple dots", () => {
      const existingFiles = [createMockPdfFile("report.final.pdf")];
      expect(generateUniqueFileName("report.final.pdf", existingFiles)).toBe(
        "report.final_2.pdf"
      );
    });
  });
});
