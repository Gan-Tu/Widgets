import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import authorWidgetHandler from "./api/author-widget.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "widget-api-dev-server",
      configureServer(server) {
        server.middlewares.use("/api/author-widget", (req, res) => {
          void authorWidgetHandler(req, res);
        });
      }
    },
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Rollup's CJS interop helper is imported by nearly every vendor
          // chunk. Left unassigned it can get hoisted into a heavy chunk
          // (e.g. @babel/parser), putting 300KB on the critical path just to
          // reach a ~50-byte helper. Pin it with react, which everything
          // already depends on.
          if (id.includes("commonjsHelpers") || id.includes("commonjs-dynamic-modules")) {
            return "vendor-react";
          }
          if (!id.includes("node_modules")) return;

          // Keep the biggest/most common libraries in predictable shared chunks.
          if (id.includes("/node_modules/react/")) return "vendor-react";
          if (id.includes("/node_modules/react-dom/")) return "vendor-react";
          if (id.includes("/node_modules/scheduler/")) return "vendor-react";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("motion")) return "vendor-motion";
          if (id.includes("zod")) return "vendor-zod";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("recharts")) return "vendor-charts";

          // Fallback: split remaining vendor code by package to avoid a single huge vendor chunk.
          const pathAfterNodeModules = id.split("node_modules/")[1];
          if (!pathAfterNodeModules) return "vendor-misc";

          const parts = pathAfterNodeModules.split("/");
          const packageName =
            parts[0]?.startsWith("@") && parts.length > 1
              ? `${parts[0]}_${parts[1]}`
              : parts[0] ?? "misc";

          return `vendor-${packageName.replace(/[@.]/g, "").replace(/_/g, "-")}`;
        }
      }
    }
  }
});
