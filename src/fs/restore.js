import fs from "node:fs/promises";
import path from "node:path";

const restore = async () => {
	const restoredFolder = "workspace_restored";
	const snapshotFile = "snapshot.json";

	try {
		const data = await fs.readFile(snapshotFile, "utf-8").catch(() => {
			throw new Error("Snapshot file not found");
		});
		
		await fs.mkdir(restoredFolder).catch((err) => {
			if (err.code === "EEXIST") {
				throw new Error("Folder already exists");
			}
			throw err;
		});
		
		const { entries } = JSON.parse(data);
		
		for (const entry of entries) {
			const fullPath = path.join(restoredFolder, entry.path);
			
			if (entry.type === "directory") {
				await fs.mkdir(fullPath, { recursive: true });
			} else {
				await fs.mkdir(path.dirname(fullPath), { recursive: true });
				await fs.writeFile(fullPath, entry.content, "base64");
			}
		}
	} catch (err) {
		console.error("FS operation failed:", err.message);
	}
};

await restore();