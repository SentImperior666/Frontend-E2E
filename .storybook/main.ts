import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y", "@storybook/addon-interactions"],
  framework: { name: "@storybook/nextjs", options: {} },
  staticDirs: ["../public"],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: "react-docgen-typescript" },
};

export default config;
