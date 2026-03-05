import { readdir, access, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

const merge = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const workspacePath = join(__dirname, "workspace");
  const partsPath = join(workspacePath, "parts");
  const outPath = join(workspacePath, "merged.txt");

  await access(workspacePath);
  await access(partsPath);

  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: { files: { type: "string", short: "f" } },
    strict: true,
    allowPositionals: false,
  });

  const files = values.files
    ? values.files.split(/\s*,\s*/).filter(Boolean).sort()
    : (await readdir(partsPath, { recursive: true })).filter((f) => f.endsWith(".txt")).sort();

  if (files.length === 0) throw new Error("FS operation failed");

  await writeFile(outPath, "");

  for (const file of files) {
    const content = await readFile(join(partsPath, file), "utf8");
    await writeFile(outPath, content, { flag: "a" });
  }

  console.log("Merged successfully");
};

try {
  await merge();
} catch {
  throw new Error("FS operation failed");
}
