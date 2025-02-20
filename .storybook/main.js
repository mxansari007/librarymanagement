/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  webpackFinal: async (config) => {
    config.module.rules.push(
      {
        test: /\.module\.css$/, // Match only CSS Modules
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]___[hash:base64:5]", // Generate scoped class names
              },
            },
          },
        ],
      },
      {
        test: /\.css$/, // Match regular CSS (non-modules)
        exclude: /\.module\.css$/,
        use: ["style-loader", "css-loader"],
      }
    );

    return config;
  },
};

export default config;

