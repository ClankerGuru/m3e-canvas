import { cp, mkdir } from "node:fs/promises";
import tailwind from "bun-plugin-tailwind";
import { SolidPlugin } from "@dschz/bun-plugin-solid";

const base = process.env.PUBLIC_BASE_PATH ?? "";

const result = await Bun.build({
  entrypoints: ["./index.html"],
  outdir: "./dist",
  minify: true,
  target: "browser",
  plugins: [
    tailwind,
    SolidPlugin({ generate: "dom", hydratable: false, sourceMaps: false }),
  ],
  define: {
    "process.env.PUBLIC_BASE_PATH": JSON.stringify(base),
  },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });

if (base) {
  const indexPath = "dist/index.html";
  const html = await Bun.file(indexPath).text();
  const withBase = html.replace("<head>", `<head>\n    <base href="${base.endsWith("/") ? base : `${base}/`}" />`);
  await Bun.write(indexPath, withBase);
}
