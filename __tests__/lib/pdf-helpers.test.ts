import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { formatTimestamp, debounce } from "@/lib/pdf-helpers";

describe("pdf-helpers", () => {
  describe("formatTimestamp", () => {
    it("should return a timestamp in YYYYMMDD-HHMMSS format", () => {
      const result = formatTimestamp();
      // Format: YYYYMMDD-HHMMSS (e.g., "20260131-143022")
      expect(result).toMatch(/^\d{8}-\d{6}$/);
    });

    it("should use current date and time", () => {
      const now = new Date();
      const result = formatTimestamp();

      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      // Check that the date portion matches (time may vary by a second)
      expect(result.startsWith(`${year}${month}${day}`)).toBe(true);
    });

    it("should pad single-digit values with zeros", () => {
      // Mock a date with single-digit month, day, hour, minute, second
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 3, 7, 9)); // Jan 5, 2026 03:07:09

      const result = formatTimestamp();
      expect(result).toBe("20260105-030709");

      vi.useRealTimers();
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should delay function execution", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should only execute once for rapid calls", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on subsequent calls", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);

      debouncedFn(); // Reset timer
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to the debounced function", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn("arg1", "arg2");
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should use the last call arguments", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn("first");
      debouncedFn("second");
      debouncedFn("third");

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith("third");
    });

    it("should have a cancel method", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();
    });

    it("should allow execution after cancel", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.cancel();

      debouncedFn(); // New call after cancel
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
