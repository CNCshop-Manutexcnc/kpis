const rawVersion = import.meta.env.VITE_APP_VERSION || "0.0.0";
const isPlaceholderVersion = rawVersion === "0.0.0";

export const VERSION = import.meta.env.DEV && isPlaceholderVersion ? "DEV" : rawVersion;
