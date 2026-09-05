import { join } from "node:path";
import { serve } from "bun";
import index from "./index.html";

const publicDir = join(import.meta.dir, "public");

function publicFile(rel: string) {
  return new Response(Bun.file(join(publicDir, rel)));
}

const server = serve({
  routes: {
    "/material-symbols.json": () => publicFile("material-symbols.json"),
    "/og.png": () => publicFile("og.png"),
    "/favicon.ico": () => publicFile("favicon.ico"),
    "/icon.svg": () => publicFile("icon.svg"),
    "/logos/:name": async (req) => {
      const name = req.params.name;
      if (!/^[\w.-]+$/.test(name)) return new Response("Not found", { status: 404 });
      const file = Bun.file(join(publicDir, "logos", name));
      if (!(await file.exists())) return new Response("Not found", { status: 404 });
      return new Response(file);
    },
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`M3E Canvas ${server.url}`);
