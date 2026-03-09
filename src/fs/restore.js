import fs from "fs";
import path from "path";

const restore = async () => {
  const snapshotFile = await fs.promises.readFile("snapshot.json", "utf-8");
  const snapshot = JSON.parse(snapshotFile);

  const restoreDir = path.join(process.cwd(), "workspace_restored");

  await fs.promises.mkdir(restoreDir, { recursive: true });

  for (const entry of snapshot.entries) {
    const entryPath = path.join(restoreDir, entry.path);

    if (entry.type === "directory") {
      await fs.promises.mkdir(entryPath, { recursive: true });
    } else {
      await fs.promises.mkdir(path.dirname(entryPath), { recursive: true });
      await fs.promises.writeFile(entryPath, Buffer.from(entry.content, "base64"));
    }
  }
};

await restore();
