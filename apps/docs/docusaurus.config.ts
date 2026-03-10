import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "react-native-goodcharts",
  url: "https://bordot.github.io",
  baseUrl: "/react-native-goodcharts/",
  favicon: "img/favicon.ico",
  organizationName: "bordot",
  projectName: "react-native-goodcharts",
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/custom.css"),
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "react-native-goodcharts",
      items: [{ to: "/docs/intro", label: "Docs", position: "left" }],
    },
  },
};

export default config;
