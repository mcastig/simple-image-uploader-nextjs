import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const getConfig = async (): Promise<Config> => {
  // Pull only the defined fields that next/jest actually configures (SWC
  // transform, CSS/font/image mocks, transformIgnorePatterns).
  const base = await createJestConfig({})();

  const sharedTransform = {
    transform: base.transform,
    transformIgnorePatterns: base.transformIgnorePatterns,
    testPathIgnorePatterns: base.testPathIgnorePatterns,
    watchPathIgnorePatterns: base.watchPathIgnorePatterns,
    moduleNameMapper: {
      ...base.moduleNameMapper,
      "^@/(.*)$": "<rootDir>/src/$1",
    },
  };

  return {
    // Coverage settings live at the root, not inside individual projects.
    collectCoverageFrom: [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.test.{ts,tsx}",
      "!src/backend/lib/fsPromises.ts",
    ],
    coverageProvider: "v8",
    coverageThreshold: {
      global: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    projects: [
      {
        ...sharedTransform,
        displayName: "node",
        // Custom env injects Node 18+ fetch globals (Response, FormData, File…)
        // that jest-environment-node's vm sandbox omits by default.
        testEnvironment: "<rootDir>/jest.env.node.js",
        testMatch: [
          "<rootDir>/src/backend/**/*.test.ts",
          "<rootDir>/src/app/api/**/*.test.ts",
        ],
      },
      {
        ...sharedTransform,
        displayName: "jsdom",
        testEnvironment: "jest-environment-jsdom",
        setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
        testMatch: [
          "<rootDir>/src/frontend/**/*.test.tsx",
          "<rootDir>/src/app/*.test.tsx",
        ],
      },
    ],
  };
};

export default getConfig;
