import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Rebuild the bundled sample utilities without requiring a browser CDN or JIT.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const templates = join(
  root,
  "packages/plugin/src/templates/_templates/formatting",
);
const temporary = mkdtempSync(join(tmpdir(), "freeform-tailwind3-"));
const input = join(temporary, "input.css");
const config = join(temporary, "config.cjs");
const output = join(templates, "tailwind-3/_tailwind.css");
const safelist = ["md", "lg", "xl"].flatMap((size) =>
  ["full", "1/2", "1/3", "1/4"].map((width) => `${size}:w-${width}`),
);

try {
  writeFileSync(
    input,
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
  );
  writeFileSync(
    config,
    `module.exports = ${JSON.stringify({
      content: [
        join(templates, "tailwind-3/**/*.twig"),
        join(templates, "tailwind-3-dark/**/*.twig"),
      ],
      safelist,
    })};\n`,
  );
  execFileSync(
    "pnpm",
    [
      "dlx",
      "tailwindcss@3.4.19",
      "--config",
      config,
      "--input",
      input,
      "--output",
      output,
      "--minify",
    ],
    {
      cwd: root,
      stdio: "inherit",
    },
  );
  copyFileSync(output, join(templates, "tailwind-3-dark/_tailwind.css"));
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
