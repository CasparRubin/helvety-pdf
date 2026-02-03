import { describe, it, expect, vi, beforeEach } from "vitest";

import { validateFileType, isPdfFile } from "@/lib/file-validation";
import {
  validateNonNegativeInteger,
  validateInstance,
  validateArray,
  validateFiniteNumber,
  validateFiles,
  isDuplicateFile,
  generateUniqueFileName,
  determineFileType,
} from "@/lib/validation-utils";

// Mock file-validation module (vitest automatically hoists vi.mock calls)
vi.mock("@/lib/file-validation", () => ({
  validateFileType: vi.fn(),
  isPdfFile: vi.fn(),
}));

// Helper to create a mock File object with specific size
function createMockFile(
  name: string,
  size: number = 1000,
  type: string = "application/pdf"
): File {
  // Create content of the specified size
  const content = "x".repeat(size);
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

// Helper to create a mock PdfFile object (matches the PdfFile interface)
function createMockPdfFileObject(
  name: string,
  size: number = 1000,
  id?: string
) {
  return {
    id: id ?? Math.random().toString(),
    file: createMockFile(name, size),
    url: "blob:test",
    pageCount: 1,
    color: "#000000",
    type: "pdf" as const,
  };
}

describe("validation-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  describe("validateInstance", () => {
    class TestClass {
      value: number;
      constructor(value: number) {
        this.value = value;
      }
    }

    class OtherClass {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
    }

    it("should pass for instances of the correct class", () => {
      const instance = new TestClass(42);
      expect(() => validateInstance(instance, TestClass, "test")).not.toThrow();
    });

    it("should throw for instances of a different class", () => {
      const other = new OtherClass("test");
      expect(() => validateInstance(other, TestClass, "test")).toThrow(
        "Expected a TestClass instance"
      );
    });

    it("should throw for plain objects", () => {
      expect(() => validateInstance({}, TestClass, "test")).toThrow(
        "Expected a TestClass instance"
      );
    });

    it("should throw for null", () => {
      expect(() => validateInstance(null, TestClass, "test")).toThrow(
        "Expected a TestClass instance"
      );
    });

    it("should throw for undefined", () => {
      expect(() => validateInstance(undefined, TestClass, "test")).toThrow(
        "Expected a TestClass instance"
      );
    });

    it("should throw for primitives", () => {
      expect(() => validateInstance(42, TestClass, "test")).toThrow(
        "Expected a TestClass instance"
      );
      expect(() => validateInstance("string", TestClass, "test")).toThrow(
        "Expected a TestClass instance"
      );
    });

    it("should work with built-in classes like Date", () => {
      const date = new Date();
      expect(() => validateInstance(date, Date, "timestamp")).not.toThrow();
      expect(() => validateInstance("not a date", Date, "timestamp")).toThrow(
        "Expected a Date instance"
      );
    });

    it("should work with built-in classes like Map", () => {
      const map = new Map();
      expect(() => validateInstance(map, Map, "cache")).not.toThrow();
      expect(() => validateInstance({}, Map, "cache")).toThrow(
        "Expected a Map instance"
      );
    });
  });

  describe("validateFiles", () => {
    beforeEach(() => {
      // Reset mocks to default behavior
      vi.mocked(validateFileType).mockReturnValue({ valid: true });
    });

    it("should return valid when all files pass validation", () => {
      const files = [createMockFile("test1.pdf"), createMockFile("test2.pdf")];
      const existingFiles: ReturnType<typeof createMockPdfFileObject>[] = [];

      const result = validateFiles(files, existingFiles);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return error when exceeding max file limit", () => {
      const files = [createMockFile("new.pdf")];
      // Create 50 existing files (max limit is 50)
      const existingFiles = Array.from({ length: 50 }, (_, i) =>
        createMockPdfFileObject(`existing${i}.pdf`)
      );

      const result = validateFiles(files, existingFiles);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Maximum 50 files allowed");
    });

    it("should return error for invalid file types", () => {
      vi.mocked(validateFileType).mockReturnValue({
        valid: false,
        error: "'test.exe' is not a supported file type.",
      });

      const files = [
        createMockFile("test.exe", 1000, "application/x-msdownload"),
      ];
      const existingFiles: ReturnType<typeof createMockPdfFileObject>[] = [];

      const result = validateFiles(files, existingFiles);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("not a supported file type");
    });

    it("should return error for empty files", () => {
      // Create a mock file with size 0
      const emptyFile = new File([], "empty.pdf", { type: "application/pdf" });
      const files = [emptyFile];
      const existingFiles: ReturnType<typeof createMockPdfFileObject>[] = [];

      const result = validateFiles(files, existingFiles);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("is empty");
    });

    it("should collect multiple errors", () => {
      vi.mocked(validateFileType)
        .mockReturnValueOnce({ valid: false, error: "'bad1.exe' invalid type" })
        .mockReturnValueOnce({ valid: true })
        .mockReturnValueOnce({
          valid: false,
          error: "'bad2.txt' invalid type",
        });

      const files = [
        createMockFile("bad1.exe"),
        createMockFile("good.pdf"),
        createMockFile("bad2.txt"),
      ];
      const existingFiles: ReturnType<typeof createMockPdfFileObject>[] = [];

      const result = validateFiles(files, existingFiles);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle empty input gracefully", () => {
      const result = validateFiles([], []);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("isDuplicateFile", () => {
    it("should return true for duplicate files (same name and size)", () => {
      const file = createMockFile("test.pdf", 1000);
      const existingFiles = [createMockPdfFileObject("test.pdf", 1000)];

      expect(isDuplicateFile(file, existingFiles)).toBe(true);
    });

    it("should return false for files with different names", () => {
      const file = createMockFile("new.pdf", 1000);
      const existingFiles = [createMockPdfFileObject("test.pdf", 1000)];

      expect(isDuplicateFile(file, existingFiles)).toBe(false);
    });

    it("should return false for files with same name but different size", () => {
      const file = createMockFile("test.pdf", 2000);
      const existingFiles = [createMockPdfFileObject("test.pdf", 1000)];

      expect(isDuplicateFile(file, existingFiles)).toBe(false);
    });

    it("should return false for empty existing files array", () => {
      const file = createMockFile("test.pdf", 1000);

      expect(isDuplicateFile(file, [])).toBe(false);
    });

    it("should check against all existing files", () => {
      const file = createMockFile("third.pdf", 3000);
      const existingFiles = [
        createMockPdfFileObject("first.pdf", 1000),
        createMockPdfFileObject("second.pdf", 2000),
        createMockPdfFileObject("third.pdf", 3000),
      ];

      expect(isDuplicateFile(file, existingFiles)).toBe(true);
    });
  });

  describe("determineFileType", () => {
    it("should return 'pdf' for PDF files", () => {
      vi.mocked(isPdfFile).mockReturnValue(true);
      const file = createMockFile("test.pdf");

      expect(determineFileType(file)).toBe("pdf");
    });

    it("should return 'image' for non-PDF files", () => {
      vi.mocked(isPdfFile).mockReturnValue(false);
      const file = createMockFile("test.png", 1000, "image/png");

      expect(determineFileType(file)).toBe("image");
    });

    it("should call isPdfFile with the file", () => {
      vi.mocked(isPdfFile).mockReturnValue(true);
      const file = createMockFile("document.pdf");

      determineFileType(file);

      expect(isPdfFile).toHaveBeenCalledWith(file);
    });
  });

  describe("generateUniqueFileName", () => {
    it("should return original name if no conflicts", () => {
      const existingFiles = [createMockPdfFileObject("other.pdf")];
      expect(generateUniqueFileName("test.pdf", existingFiles)).toBe(
        "test.pdf"
      );
    });

    it("should add _2 suffix for first conflict", () => {
      const existingFiles = [createMockPdfFileObject("test.pdf")];
      expect(generateUniqueFileName("test.pdf", existingFiles)).toBe(
        "test_2.pdf"
      );
    });

    it("should increment suffix for multiple conflicts", () => {
      const existingFiles = [
        createMockPdfFileObject("test.pdf"),
        createMockPdfFileObject("test_2.pdf"),
        createMockPdfFileObject("test_3.pdf"),
      ];
      expect(generateUniqueFileName("test.pdf", existingFiles)).toBe(
        "test_4.pdf"
      );
    });

    it("should handle files without extensions", () => {
      const existingFiles = [createMockPdfFileObject("readme")];
      expect(generateUniqueFileName("readme", existingFiles)).toBe("readme_2");
    });

    it("should handle empty existing files", () => {
      expect(generateUniqueFileName("test.pdf", [])).toBe("test.pdf");
    });

    it("should consider usedNames set", () => {
      const existingFiles: ReturnType<typeof createMockPdfFileObject>[] = [];
      const usedNames = new Set(["test.pdf", "test_2.pdf"]);
      expect(generateUniqueFileName("test.pdf", existingFiles, usedNames)).toBe(
        "test_3.pdf"
      );
    });

    it("should handle files with multiple dots", () => {
      const existingFiles = [createMockPdfFileObject("report.final.pdf")];
      expect(generateUniqueFileName("report.final.pdf", existingFiles)).toBe(
        "report.final_2.pdf"
      );
    });
  });
});
