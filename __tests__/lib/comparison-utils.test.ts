import { describe, it, expect } from "vitest";

import {
  areArraysEqualById,
  shallowEqual,
  areArraysEqual,
  areSetsEqual,
  areRotationsEqual,
} from "@/lib/comparison-utils";

describe("comparison-utils", () => {
  describe("areArraysEqualById", () => {
    it("should return true for same reference", () => {
      const arr = [{ id: "1" }, { id: "2" }];
      expect(areArraysEqualById(arr, arr)).toBe(true);
    });

    it("should return true for arrays with same ids", () => {
      const arr1 = [
        { id: "1", name: "foo" },
        { id: "2", name: "bar" },
      ];
      const arr2 = [
        { id: "1", name: "different" },
        { id: "2", name: "also different" },
      ];
      expect(areArraysEqualById(arr1, arr2)).toBe(true);
    });

    it("should return false for arrays with different ids", () => {
      const arr1 = [{ id: "1" }, { id: "2" }];
      const arr2 = [{ id: "1" }, { id: "3" }];
      expect(areArraysEqualById(arr1, arr2)).toBe(false);
    });

    it("should return false for arrays of different lengths", () => {
      const arr1 = [{ id: "1" }, { id: "2" }];
      const arr2 = [{ id: "1" }];
      expect(areArraysEqualById(arr1, arr2)).toBe(false);
    });

    it("should return true for empty arrays", () => {
      expect(areArraysEqualById([], [])).toBe(true);
    });
  });

  describe("shallowEqual", () => {
    it("should return true for same reference", () => {
      const obj = { a: 1, b: 2 };
      expect(shallowEqual(obj, obj)).toBe(true);
    });

    it("should return true for equal objects", () => {
      const obj1 = { a: 1, b: "test", c: true };
      const obj2 = { a: 1, b: "test", c: true };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it("should return false for different values", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it("should return false for different keys", () => {
      const obj1 = { a: 1, b: 2 } as Record<string, unknown>;
      const obj2 = { a: 1, c: 2 } as Record<string, unknown>;
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it("should return false for different number of keys", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2, c: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it("should return true for empty objects", () => {
      expect(shallowEqual({}, {})).toBe(true);
    });
  });

  describe("areArraysEqual", () => {
    it("should return true for same reference", () => {
      const arr = [1, 2, 3];
      expect(areArraysEqual(arr, arr)).toBe(true);
    });

    it("should return true for equal arrays", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(areArraysEqual(arr1, arr2)).toBe(true);
    });

    it("should return false for different values", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(areArraysEqual(arr1, arr2)).toBe(false);
    });

    it("should return false for different lengths", () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(areArraysEqual(arr1, arr2)).toBe(false);
    });

    it("should return true for empty arrays", () => {
      expect(areArraysEqual([], [])).toBe(true);
    });

    it("should work with string arrays", () => {
      expect(areArraysEqual(["a", "b"], ["a", "b"])).toBe(true);
      expect(areArraysEqual(["a", "b"], ["a", "c"])).toBe(false);
    });
  });

  describe("areSetsEqual", () => {
    it("should return true for equal sets", () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 3]);
      expect(areSetsEqual(set1, set2)).toBe(true);
    });

    it("should return true regardless of insertion order", () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([3, 1, 2]);
      expect(areSetsEqual(set1, set2)).toBe(true);
    });

    it("should return false for different sizes", () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2]);
      expect(areSetsEqual(set1, set2)).toBe(false);
    });

    it("should return false for different values", () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 4]);
      expect(areSetsEqual(set1, set2)).toBe(false);
    });

    it("should return true for empty sets", () => {
      expect(areSetsEqual(new Set(), new Set())).toBe(true);
    });
  });

  describe("areRotationsEqual", () => {
    it("should return true for equal rotations", () => {
      const rot1 = { 1: 90, 2: 180 };
      const rot2 = { 1: 90, 2: 180 };
      expect(areRotationsEqual(rot1, rot2)).toBe(true);
    });

    it("should return false for different values", () => {
      const rot1 = { 1: 90, 2: 180 };
      const rot2 = { 1: 90, 2: 270 };
      expect(areRotationsEqual(rot1, rot2)).toBe(false);
    });

    it("should return false for different keys", () => {
      const rot1 = { 1: 90, 2: 180 };
      const rot2 = { 1: 90, 3: 180 };
      expect(areRotationsEqual(rot1, rot2)).toBe(false);
    });

    it("should return false for different number of keys", () => {
      const rot1 = { 1: 90, 2: 180 };
      const rot2 = { 1: 90, 2: 180, 3: 270 };
      expect(areRotationsEqual(rot1, rot2)).toBe(false);
    });

    it("should return true for empty objects", () => {
      expect(areRotationsEqual({}, {})).toBe(true);
    });
  });
});
