module.exports = {
  roots: ["<rootDir>/__tests__"],
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.base.json",
      },
    ],
  },
  moduleNameMapper: {
    "^react-native-goodcharts$": "<rootDir>/packages/charts/src/index.ts",
    "^react-native-goodcharts/(.*)$": "<rootDir>/packages/charts/src/$1",
    "^d3-array$": "<rootDir>/test-support/d3-array.ts",
    "^d3-scale$": "<rootDir>/test-support/d3-scale.ts",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/test-support/"],
};
