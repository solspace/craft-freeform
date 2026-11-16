import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { buildClient, publishClientBuild } from "./build.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "freeform-client-build-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const live = path.join(root, "live");
  await writeBuild(live, "old");
  return { root, live };
}

async function writeBuild(directory, version) {
  await mkdir(path.join(directory, "assets"), { recursive: true });
  await writeFile(
    path.join(directory, `assets/${version}.js`),
    `export default '${version}';`,
  );
  await writeFile(
    path.join(directory, `assets/${version}.css`),
    `.${version}{color:red}`,
  );
  await writeFile(
    path.join(directory, `assets/lazy-${version}.js`),
    `export default '${version} lazy';`,
  );
  const manifest = {
    "src/index.tsx": {
      file: `assets/${version}.js`,
      css: [`assets/${version}.css`],
      dynamicImports: ["src/lazy.tsx"],
    },
    "src/lazy.tsx": { file: `assets/lazy-${version}.js` },
  };
  await writeFile(
    path.join(directory, "manifest.json"),
    JSON.stringify(manifest),
  );
  return manifest;
}

async function assertUsable(directory) {
  const manifest = JSON.parse(
    await readFile(path.join(directory, "manifest.json")),
  );
  for (const chunk of Object.values(manifest)) {
    for (const file of [chunk.file, ...(chunk.css ?? [])]) {
      assert.ok((await readFile(path.join(directory, file))).length);
    }
  }
  return manifest;
}

test("live assets stay usable throughout publication, including old lazy chunks", async (t) => {
  const { root, live } = await fixture(t);
  const staged = path.join(root, "staged");
  const next = await writeBuild(staged, "new");
  let finished = false;
  const publishing = publishClientBuild(staged, live).finally(() => {
    finished = true;
  });
  while (!finished) {
    await assertUsable(live);
    await setImmediate();
  }
  await publishing;
  assert.deepEqual(await assertUsable(live), next);
  assert.equal(
    await readFile(path.join(live, "assets/lazy-old.js"), "utf8"),
    "export default 'old lazy';",
  );
  assert.deepEqual((await readdir(live)).sort(), ["assets", "manifest.json"]);
});

test("failed builds preserve the served build and clean their staging directory", async (t) => {
  const { live } = await fixture(t);
  const before = await assertUsable(live);
  let staging;
  await assert.rejects(
    buildClient(
      [],
      async (directory) => {
        staging = directory;
        await writeFile(path.join(directory, "partial.js"), "incomplete");
        assert.deepEqual(await assertUsable(live), before);
        throw new Error("compilation failed");
      },
      live,
    ),
    /compilation failed/,
  );
  assert.deepEqual(await assertUsable(live), before);
  await assert.rejects(readdir(staging), { code: "ENOENT" });
});

for (const invalid of [
  "missing-file",
  "missing-import",
  "missing-entry",
  "traversal",
]) {
  test(`invalid builds never replace the live manifest: ${invalid}`, async (t) => {
    const { root, live } = await fixture(t);
    const before = await assertUsable(live);
    const staged = path.join(root, "staged");
    const manifest = await writeBuild(staged, "new");
    if (invalid === "missing-file")
      await rm(path.join(staged, "assets/lazy-new.js"));
    if (invalid === "missing-import")
      manifest["src/index.tsx"].imports = ["missing"];
    if (invalid === "missing-entry") delete manifest["src/index.tsx"];
    if (invalid === "traversal")
      manifest["src/index.tsx"].file = "../outside.js";
    await writeFile(
      path.join(staged, "manifest.json"),
      JSON.stringify(manifest),
    );
    await assert.rejects(publishClientBuild(staged, live));
    assert.deepEqual(await assertUsable(live), before);
    assert.deepEqual((await readdir(path.join(live, "assets"))).sort(), [
      "lazy-old.js",
      "old.css",
      "old.js",
    ]);
  });
}

test("a publication error leaves the previous manifest and chunks usable", async (t) => {
  const { root, live } = await fixture(t);
  const before = await assertUsable(live);
  const staged = path.join(root, "staged");
  await writeBuild(staged, "new");
  await mkdir(path.join(live, "assets/new.js"));
  await assert.rejects(publishClientBuild(staged, live));
  assert.deepEqual(await assertUsable(live), before);
});

test("concurrent builds publish complete manifests without removing either build's chunks", async (t) => {
  const { root, live } = await fixture(t);
  const a = path.join(root, "a");
  const b = path.join(root, "b");
  await writeBuild(a, "a");
  await writeBuild(b, "b");
  await Promise.all([publishClientBuild(a, live), publishClientBuild(b, live)]);
  await assertUsable(live);
  for (const version of ["old", "a", "b"]) {
    assert.ok(
      (await readFile(path.join(live, `assets/lazy-${version}.js`))).length,
    );
  }
});
