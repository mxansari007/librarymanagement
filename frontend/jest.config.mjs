export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-env", "@babel/preset-react"] }],
    },
    extensionsToTreatAsEsm: [".jsx"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
};
