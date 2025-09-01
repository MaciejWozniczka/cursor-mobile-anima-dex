import {
  formatDate,
  formatDateTime,
  capitalizeFirst,
  truncateText,
  sortByDate,
  sortByName,
  filterBySearch,
  arrayBufferToBase64,
  base64ToDataURL,
  isValidBase64,
  isValidEmail,
  isValidPassword,
  isIOS,
  isAndroid,
  generateId,
  createError,
  debounce,
  throttle,
  getStorageKey,
  interpolateValue,
  formatFileSize,
  retry,
  createTimeoutSignal,
} from "../../src/utils/helpers";

// Mock dla Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

describe("Helpers", () => {
  describe("Date formatting", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date);
      expect(result).toContain("15");
      expect(result).toContain("stycznia");
      expect(result).toContain("2024");
    });

    it("should format date time correctly", () => {
      const date = new Date("2024-01-15T10:30:00");
      const result = formatDateTime(date);
      expect(result).toContain("15");
      expect(result).toContain("stycznia");
      expect(result).toContain("2024");
      expect(result).toContain("10:30");
    });
  });

  describe("String utilities", () => {
    it("should capitalize first letter", () => {
      expect(capitalizeFirst("hello")).toBe("Hello");
      expect(capitalizeFirst("WORLD")).toBe("World");
      expect(capitalizeFirst("test")).toBe("Test");
    });

    it("should truncate text correctly", () => {
      expect(truncateText("Hello World", 5)).toBe("Hello...");
      expect(truncateText("Short", 10)).toBe("Short");
      expect(truncateText("", 5)).toBe("");
    });
  });

  describe("Array utilities", () => {
    const mockItems = [
      {
        animalName: "Zebra",
        discoveredAt: "2024-01-01",
        description: "Zebra description",
      },
      {
        animalName: "Antylopa",
        discoveredAt: "2024-01-03",
        description: "Antylopa description",
      },
      {
        animalName: "Kot",
        discoveredAt: "2024-01-02",
        description: "Kot description",
      },
    ];

    it("should sort by date ascending", () => {
      const result = sortByDate(mockItems, "asc");
      expect(result[0]?.discoveredAt).toBe("2024-01-01");
      expect(result[2]?.discoveredAt).toBe("2024-01-03");
    });

    it("should sort by date descending", () => {
      const result = sortByDate(mockItems, "desc");
      expect(result[0]?.discoveredAt).toBe("2024-01-03");
      expect(result[2]?.discoveredAt).toBe("2024-01-01");
    });

    it("should sort by name ascending", () => {
      const result = sortByName(mockItems, "asc");
      expect(result[0]?.animalName).toBe("Antylopa");
      expect(result[2]?.animalName).toBe("Zebra");
    });

    it("should sort by name descending", () => {
      const result = sortByName(mockItems, "desc");
      expect(result[0]?.animalName).toBe("Zebra");
      expect(result[2]?.animalName).toBe("Antylopa");
    });

    it("should filter by search term", () => {
      const result = filterBySearch(mockItems, "kot");
      expect(result).toHaveLength(1);
      expect(result[0]?.animalName).toBe("Kot");
    });

    it("should return all items for empty search", () => {
      const result = filterBySearch(mockItems, "");
      expect(result).toHaveLength(3);
    });
  });

  describe("Image utilities", () => {
    it("should convert ArrayBuffer to base64", () => {
      const buffer = new ArrayBuffer(4);
      const uint8Array = new Uint8Array(buffer);
      uint8Array[0] = 65; // 'A'
      uint8Array[1] = 66; // 'B'
      uint8Array[2] = 67; // 'C'
      uint8Array[3] = 68; // 'D'

      const result = arrayBufferToBase64(buffer);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should create data URL from base64", () => {
      const base64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      const result = base64ToDataURL(base64, "image/png");
      expect(result).toBe(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      );
    });

    it("should validate base64 string", () => {
      const validBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      const invalidBase64 = "invalid-base64!@#";

      expect(isValidBase64(validBase64)).toBe(true);
      expect(isValidBase64(invalidBase64)).toBe(false);
      expect(isValidBase64("")).toBe(false);
    });
  });

  describe("Validation utilities", () => {
    it("should validate email correctly", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    it("should validate password correctly", () => {
      expect(isValidPassword("password123")).toBe(true);
      expect(isValidPassword("12345")).toBe(false);
      expect(isValidPassword("")).toBe(false);
    });
  });

  describe("Platform utilities", () => {
    it("should detect iOS platform", () => {
      expect(isIOS).toBe(true);
    });

    it("should detect Android platform", () => {
      expect(isAndroid).toBe(false);
    });
  });

  describe("ID generation", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
    });
  });

  describe("Error handling", () => {
    it("should create error object", () => {
      const error = createError("TEST_ERROR", "Test error message", {
        detail: "test",
      });

      expect(error.code).toBe("TEST_ERROR");
      expect(error.message).toBe("Test error message");
      expect(error.details).toEqual({ detail: "test" });
    });
  });

  describe("Debounce utility", () => {
    it("should debounce function calls", (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
        expect(callCount).toBe(1);
        done();
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();
    });
  });

  describe("Throttle utility", () => {
    it("should throttle function calls", (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  describe("Storage utilities", () => {
    it("should generate storage key", () => {
      const result = getStorageKey("test");
      expect(result).toBe("animal_dex_test");
    });
  });

  describe("Animation utilities", () => {
    it("should interpolate value correctly", () => {
      const result = interpolateValue(50, [0, 100], [0, 200]);
      expect(result).toBe(100);
    });
  });

  describe("File size formatting", () => {
    it("should format file sizes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
    });
  });

  describe("Retry utility", () => {
    it("should retry failed operation", async () => {
      let attempts = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Operation failed");
        }
        return "success";
      });

      const result = await retry(operation, 3, 100);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should throw error after max retries", async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error("Operation failed"));

      await expect(retry(operation, 2, 100)).rejects.toThrow(
        "Operation failed"
      );
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("Timeout utility", () => {
    it("should create AbortSignal with timeout", () => {
      const signal = createTimeoutSignal(1000);

      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it("should abort signal after timeout", (done) => {
      const signal = createTimeoutSignal(100);

      signal.addEventListener("abort", () => {
        expect(signal.aborted).toBe(true);
        done();
      });
    });
  });
});
