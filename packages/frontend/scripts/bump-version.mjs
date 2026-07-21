#!/usr/bin/env node
/**
 * Bump all @solspace/freeform-* packages together and sync runtime version.ts files.
 *
 * Usage (from Freeform repo root):
 *   pnpm frontend:bump patch
 *   pnpm frontend:bump minor
 *   pnpm frontend:bump major
 *   pnpm frontend:bump 0.2.0
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, "..");

const packages = [
  {
    dir: join(frontendRoot, "core"),
    versionFile: join(frontendRoot, "core/src/version.ts"),
    peerOf: null,
  },
  {
    dir: join(frontendRoot, "react"),
    versionFile: join(frontendRoot, "react/src/version.ts"),
    peerOf: "@solspace/freeform-core",
  },
  {
    dir: join(frontendRoot, "extensions"),
    versionFile: join(frontendRoot, "extensions/src/version.ts"),
    peerOf: "@solspace/freeform-core",
  },
  {
    dir: join(frontendRoot, "themes/react-default"),
    versionFile: null,
    peerOf: "@solspace/freeform-react",
  },
];

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Expected x.y.z version, got: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function bump(version, kind) {
  const parts = parseVersion(version);
  if (kind === "major") {
    return formatVersion({ major: parts.major + 1, minor: 0, patch: 0 });
  }
  if (kind === "minor") {
    return formatVersion({
      major: parts.major,
      minor: parts.minor + 1,
      patch: 0,
    });
  }
  if (kind === "patch") {
    return formatVersion({
      major: parts.major,
      minor: parts.minor,
      patch: parts.patch + 1,
    });
  }
  // explicit version
  parseVersion(kind);
  return kind;
}

/** Peer range for 0.x keeps ^0.minor.0; for 1+ uses ^major.0.0 */
function peerRange(version) {
  const { major, minor } = parseVersion(version);
  if (major === 0) {
    return `^0.${minor}.0`;
  }
  return `^${major}.0.0`;
}

function writeVersionTs(path, version) {
  writeFileSync(
    path,
    `/** Kept in sync with package.json by \`pnpm frontend:bump\`. */\nexport const PACKAGE_VERSION = ${JSON.stringify(version)};\n`,
  );
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: pnpm frontend:bump <patch|minor|major|x.y.z>");
  process.exit(1);
}

const corePkgPath = join(packages[0].dir, "package.json");
const current = JSON.parse(readFileSync(corePkgPath, "utf8")).version;
const next = bump(current, arg);
const peers = peerRange(next);

for (const pkg of packages) {
  const pkgPath = join(pkg.dir, "package.json");
  const json = JSON.parse(readFileSync(pkgPath, "utf8"));
  json.version = next;

  if (pkg.peerOf && json.peerDependencies?.[pkg.peerOf]) {
    json.peerDependencies[pkg.peerOf] = peers;
  }

  writeFileSync(pkgPath, `${JSON.stringify(json, null, 2)}\n`);

  if (pkg.versionFile) {
    writeVersionTs(pkg.versionFile, next);
  }

  console.warn(`${json.name} -> ${next}`);
}

console.warn(`\nPeer ranges set to ${peers} where applicable.`);
console.warn("Next: build packages, then publish (see PACKAGE-RELEASE.md).");
