import packageJson from "../package.json";

const rawVersion = packageJson.version;
const isPlaceholderVersion = rawVersion === "0.0.0";

export const VERSION = import.meta.env.DEV && isPlaceholderVersion ? "DEV" : rawVersion;
