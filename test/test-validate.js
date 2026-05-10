import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const validateJs = join(repoRoot, "validate.js");

test("validate.js exits 0 on shipped templates and examples", () => {
  const result = spawnSync(process.execPath, [validateJs], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    // Surface stdout/stderr in the failure message so CI logs are useful.
    const detail = `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`;
    assert.fail(`validate.js exited with status ${result.status}\n${detail}`);
  }

  assert.equal(result.status, 0);
  assert.match(result.stdout, /checked \d+ file\(s\)/);
});
