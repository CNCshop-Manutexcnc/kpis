import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8"),
  ) as { version: string };

  const appVersion = process.env.VITE_APP_VERSION || packageJson.version;

  return {
    base:
      process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY
        ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
        : "/",
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      legacy({
        targets: ["defaults", "chrome >= 49", "safari >= 10", "ios >= 10"],
        modernPolyfills: true,
        renderLegacyChunks: true,
      }),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
