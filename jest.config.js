module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$"],
  transform: {
    "^.+\\.(js|jsx)?$": "<rootDir>/node_modules/babel-jest",
  },
};
