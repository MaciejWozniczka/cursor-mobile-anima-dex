module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.(ts|tsx)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native-safe-area-context$": "<rootDir>/tests/__mocks__/react-native-safe-area-context.ts",
    "^@expo/vector-icons$": "<rootDir>/tests/__mocks__/expo-vector-icons.ts",
  },
  // setupFiles: ["<rootDir>/tests/setup.ts"], // Usunięte - problemy z globalnym mockiem
};
