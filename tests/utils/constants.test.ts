import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../src/utils/constants";

// Mock dla Dimensions
jest.mock("react-native", () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

describe("Constants", () => {
  describe("Screen Dimensions", () => {
    it("should have screen dimensions", () => {
      expect(SCREEN_WIDTH).toBe(375);
      expect(SCREEN_HEIGHT).toBe(812);
    });
  });

  describe("Colors", () => {
    it("should have primary colors", () => {
      expect(COLORS.primary).toBe("#3B82F6");
      expect(COLORS.primaryDark).toBe("#1D4ED8");
      expect(COLORS.primaryLight).toBe("#60A5FA");
    });

    it("should have secondary colors", () => {
      expect(COLORS.secondary).toBe("#6366F1");
      expect(COLORS.secondaryDark).toBe("#4338CA");
      expect(COLORS.secondaryLight).toBe("#818CF8");
    });

    it("should have accent colors", () => {
      expect(COLORS.accent).toBe("#06B6D4");
      expect(COLORS.accentDark).toBe("#0891B2");
      expect(COLORS.accentLight).toBe("#22D3EE");
    });

    it("should have neutral colors", () => {
      expect(COLORS.white).toBe("#FFFFFF");
      expect(COLORS.black).toBe("#000000");
      expect(COLORS.gray).toBe("#6B7280");
    });

    it("should have status colors", () => {
      expect(COLORS.success).toBe("#10B981");
      expect(COLORS.warning).toBe("#F59E0B");
      expect(COLORS.error).toBe("#EF4444");
      expect(COLORS.info).toBe("#3B82F6");
    });
  });

  describe("Typography", () => {
    it("should have font sizes", () => {
      expect(FONTS.sizes.xs).toBe(12);
      expect(FONTS.sizes.sm).toBe(14);
      expect(FONTS.sizes.md).toBe(16);
      expect(FONTS.sizes.lg).toBe(18);
      expect(FONTS.sizes.xl).toBe(20);
      expect(FONTS.sizes.xxl).toBe(24);
      expect(FONTS.sizes.xxxl).toBe(32);
    });

    it("should have font weights", () => {
      expect(FONTS.weights.normal).toBe("400");
      expect(FONTS.weights.medium).toBe("500");
      expect(FONTS.weights.semibold).toBe("600");
      expect(FONTS.weights.bold).toBe("700");
    });
  });

  describe("Spacing", () => {
    it("should have spacing values", () => {
      expect(SPACING.xs).toBe(4);
      expect(SPACING.sm).toBe(8);
      expect(SPACING.md).toBe(16);
      expect(SPACING.lg).toBe(24);
      expect(SPACING.xl).toBe(32);
      expect(SPACING.xxl).toBe(48);
      expect(SPACING.xxxl).toBe(64);
    });
  });

  describe("Border Radius", () => {
    it("should have border radius values", () => {
      expect(BORDER_RADIUS.xs).toBe(4);
      expect(BORDER_RADIUS.sm).toBe(8);
      expect(BORDER_RADIUS.md).toBe(12);
      expect(BORDER_RADIUS.lg).toBe(16);
      expect(BORDER_RADIUS.xl).toBe(24);
      expect(BORDER_RADIUS.round).toBe(50);
    });
  });

  describe("Shadows", () => {
    it("should have shadow definitions", () => {
      expect(SHADOWS.small).toBeDefined();
      expect(SHADOWS.medium).toBeDefined();
      expect(SHADOWS.large).toBeDefined();
    });
  });
});
