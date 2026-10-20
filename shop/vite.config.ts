import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checkout from "./api/checkout.mjs";
import status from "./api/session-status.mjs";
import { paymentMode } from "./server/mode.mjs";
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  if (process.env.VITE_SHOP_MODE === "live" && paymentMode() !== "live")
    throw new Error("Live storefront requires explicitly approved production configuration.");
  return {
    plugins: [
      react(),
      {
        name: "live-search-indexing",
        transformIndexHtml(html) {
          return process.env.VITE_SHOP_MODE === "live"
            ? html.replace('content="noindex,nofollow"', 'content="index,follow"')
            : html;
        },
      },
      {
        name: "local-checkout",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const path = req.url?.split("?")[0];
            if (path !== "/api/checkout" && path !== "/api/session-status")
              return next();
            let raw = "";
            for await (const chunk of req) {
              raw += chunk;
              if (raw.length > 8192) {
                res.statusCode = 413;
                res.end();
                return;
              }
            }
            try {
              const request = Object.assign(req, {
                body: raw ? JSON.parse(raw) : undefined,
              });
              await (path === "/api/checkout" ? checkout : status)(
                request,
                res,
              );
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: "Ungültige Anfrage." }));
            }
          });
        },
      },
    ],
    build: { target: "es2022" },
  };
});
