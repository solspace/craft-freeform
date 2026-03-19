import { rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build, context } from "esbuild";
import { globSync } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = new Set(process.argv.slice(2));
const isProduction = args.has("--production");
const isWatch = args.has("--watch");

const sourceRoot = path.join(__dirname, "src/components");
const outputRoot = path.resolve(
  __dirname,
  "../plugin/src/Resources/js/scripts",
);
const entryPoints = globSync("src/components/**/!(*.*).{js,ts}", {
  cwd: __dirname,
  posix: true,
}).sort();

if (!entryPoints.length) {
  throw new Error("No entry points found in packages/scripts/src/components");
}

const normalizeLicenseFilesPlugin = {
  name: "normalize-license-files",
  setup(buildContext) {
    buildContext.onEnd(async (result) => {
      if (result.errors.length) {
        return;
      }

      const legalFiles = globSync("**/*.LEGAL.txt", {
        cwd: outputRoot,
        nodir: true,
        posix: true,
      });

      await Promise.all(
        legalFiles.map(async (file) => {
          const source = path.join(outputRoot, file);
          const target = source.replace(/\.LEGAL\.txt$/, ".LICENSE.txt");

          await rename(source, target);
        }),
      );
    });
  },
};

const rejectStyleImportsPlugin = {
  name: "reject-style-imports",
  setup(buildContext) {
    buildContext.onResolve({ filter: /\.(css|scss|sass)$/ }, (args) => ({
      errors: [
        {
          text: `Style imports are not supported in packages/scripts (${args.path}). Move styles into packages/styles.`,
        },
      ],
    }));
  },
};

const buildOptions = {
  absWorkingDir: __dirname,
  entryPoints,
  outdir: outputRoot,
  outbase: sourceRoot,
  entryNames: "[dir]/[name]",
  platform: "browser",
  format: "iife",
  bundle: true,
  splitting: false,
  sourcemap: isProduction ? false : "linked",
  minify: isProduction,
  target: ["chrome79", "edge79", "firefox78", "safari13"],
  legalComments: "external",
  logLevel: "info",
  alias: {
    "@lib": path.join(__dirname, "src/lib"),
    "@components": path.join(__dirname, "src/components"),
  },
  plugins: [rejectStyleImportsPlugin, normalizeLicenseFilesPlugin],
};

if (isWatch) {
  const buildContext = await context(buildOptions);

  await buildContext.watch();
} else {
  await build(buildOptions);
}
