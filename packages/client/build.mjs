import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(
  packageDirectory,
  "../plugin/src/Resources/js/client",
);
const manifestName = "manifest.json";

async function filesIn(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(
        ...(await filesIn(path.join(directory, entry.name), relative)),
      );
    } else if (entry.isFile()) {
      files.push(relative);
    } else {
      throw new Error(`Unexpected client build entry: ${relative}`);
    }
  }
  return files;
}

/** Validate everything before touching the currently served build. */
export async function publishClientBuild(stagingDirectory, destination) {
  const manifestContents = await readFile(
    path.join(stagingDirectory, manifestName),
  );
  const manifest = JSON.parse(manifestContents);
  if (!manifest?.["src/index.tsx"]?.file) {
    throw new Error("Client build manifest is missing src/index.tsx");
  }
  const files = await filesIn(stagingDirectory);
  const available = new Set(files);
  for (const [key, chunk] of Object.entries(manifest)) {
    for (const file of [
      chunk.file,
      ...(chunk.css ?? []),
      ...(chunk.assets ?? []),
    ]) {
      if (
        typeof file !== "string" ||
        file.includes("\\") ||
        path.isAbsolute(file) ||
        file.split("/").includes("..") ||
        !available.has(file)
      ) {
        throw new Error(
          `Client build file is missing or invalid: ${key}: ${file}`,
        );
      }
    }
    for (const imported of [
      ...(chunk.imports ?? []),
      ...(chunk.dynamicImports ?? []),
    ]) {
      if (!manifest[imported])
        throw new Error(`Client build import is missing: ${imported}`);
    }
  }

  // Content-hashed files from the previous build remain available to requests
  // already in flight. Never empty the live directory during a rebuild.
  for (const file of files.filter((file) => file !== manifestName)) {
    const source = path.join(stagingDirectory, file);
    const target = path.join(destination, file);
    const contents = await readFile(source);
    const current = await readFile(target).catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return null;
    });
    if (current?.equals(contents)) continue;
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = path.join(
      path.dirname(target),
      `.${path.basename(target)}.${randomUUID()}.tmp`,
    );
    try {
      await copyFile(source, temporary);
      await rename(temporary, target);
    } finally {
      await rm(temporary, { force: true });
    }
  }

  await mkdir(destination, { recursive: true });
  const temporaryManifest = path.join(
    destination,
    `.manifest.${randomUUID()}.tmp`,
  );
  try {
    await copyFile(
      path.join(stagingDirectory, manifestName),
      temporaryManifest,
    );
    await rename(temporaryManifest, path.join(destination, manifestName));
  } finally {
    await rm(temporaryManifest, { force: true });
  }
}

export async function buildClient(
  args = process.argv.slice(2),
  runBuild,
  destination = outputDirectory,
) {
  const staging = await mkdtemp(path.join(packageDirectory, ".client-build-"));
  try {
    if (runBuild) {
      await runBuild(staging);
    } else {
      const require = createRequire(import.meta.url);
      const vite = path.join(
        path.dirname(require.resolve("vite/package.json")),
        "bin/vite.js",
      );
      await new Promise((resolve, reject) => {
        const child = spawn(
          process.execPath,
          [vite, "build", ...args, "--outDir", staging],
          { cwd: packageDirectory, stdio: "inherit" },
        );
        child.on("error", reject);
        child.on("exit", (code, signal) =>
          code === 0
            ? resolve()
            : reject(new Error(`Client build failed (${signal ?? code})`)),
        );
      });
    }
    await publishClientBuild(staging, destination);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await buildClient();
}
