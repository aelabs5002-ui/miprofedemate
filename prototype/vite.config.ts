import { defineConfig } from "vite";
import { execSync } from "child_process";

const getBuildId = () => {
  if (process.env.VITE_BUILD_ID) return process.env.VITE_BUILD_ID;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day}-${hours}${minutes}`;
};

const buildId = getBuildId();
console.log(`[FORCE BUILD] Building with ID: ${buildId}`);

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(buildId),
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public",
});

