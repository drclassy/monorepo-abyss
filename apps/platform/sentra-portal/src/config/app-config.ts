import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Sentra Portal",
  version: packageJson.version,
  copyright: `© ${currentYear}, The Abyss.`,
  meta: {
    title: "Sentra Portal - The Abyss Orchestration Dashboard",
    description:
      "Sentra Portal is the command center for The Abyss monorepo, providing real-time AI flow orchestration, Saga monitoring, and autonomous agent governance.",
  },
};
