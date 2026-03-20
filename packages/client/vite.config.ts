import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certDir = path.resolve(__dirname, "./config/certs");
const keyPath = path.join(certDir, "key.pem");
const certPath = path.join(certDir, "cert.pem");
const hasCertificates = existsSync(keyPath) && existsSync(certPath);

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, __dirname, "");
  const host = "127.0.0.1";
  const port = env.PORT ? parseInt(env.PORT, 10) : 5173;

  return {
    appType: "custom",
    plugins: [react()],
    base: command === "serve" ? "/" : "./",
    server: {
      host,
      port,
      strictPort: true,
      cors: true,
      allowedHosts: true,
      hmr: true,
      https: hasCertificates
        ? {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          }
        : undefined,
    },
    resolve: {
      alias: {
        "@config": path.resolve(__dirname, "./config"),
        "@editor": path.resolve(__dirname, "./src/app/pages/forms/edit"),
        "@components": path.resolve(__dirname, "./src/app/components"),
        "@form-controls": path.resolve(
          __dirname,
          "./src/app/components/form-controls",
        ),
        "@ff-icons": path.resolve(__dirname, "./src/assets/icons"),
        "@ff-client": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "es2020",
      emptyOutDir: true,
      sourcemap: false,
      manifest: "manifest.json",
      outDir: path.resolve(__dirname, "../plugin/src/Resources/js/client"),
      rollupOptions: {
        input: path.resolve(__dirname, "./src/index.tsx"),
        output: {
          manualChunks: (id) => {
            if (!id.includes("node_modules")) {
              return;
            }

            if (id.includes("node_modules/date-fns/")) {
              return "date-fns";
            }

            return "vendor";
          },
        },
      },
    },
  };
});
