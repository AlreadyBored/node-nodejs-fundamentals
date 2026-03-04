import { readFile, writeFile, mkdir } from 'node:fs/promises';
const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  const snapshotData = await readFile('snapshot.json', 'utf-8');
  const snapshot = JSON.parse(snapshotData);
  const rootPath = `${process.cwd()}/workspace_restored`;
  try {
    await mkdir(rootPath);
    for (const entry of snapshot.entries) {
      if(entry.type === 'directory') {
        await mkdir(`${rootPath}/${entry.path}`, { recursive: true });
      }
      else {
        const contentBuffer = Buffer.from(entry.content, 'base64');
        await writeFile(`${rootPath}/${entry.path}`, contentBuffer);
      }
    }
  } catch (err) {
    console.error("Error creating workspace_restored directory:", err);
    throw new Error("FS operation failed")
  }
};

await restore();
