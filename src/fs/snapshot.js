import fs from "node:fs/promises";
import path from "node:path";

const snapshot = async () => {
	const root = process.cwd();
	const restoredFolder = "workspace_restored";

	try {
		const files = await fs.readdir(root, { recursive: true, withFileTypes: true });

		const entries = await Promise.all(files
			.filter(file => !file.name.includes(restoredFolder))
			.map(async (file) => {
				const fullPath = path.join(file.parentPath, file.name);
				const isFile = file.isFile();
				const relPath = path.relative(root, fullPath);

				let extra = {};
				if (isFile) {
					const { size } = await fs.stat(fullPath);
					const content = await fs.readFile(fullPath);
					extra = { size, content: content.toString("base64") };
				}

				return { path: relPath, type: isFile ? "file" : "directory", ...extra };
			})
		);

		await fs.writeFile(
			"snapshot.json",
			JSON.stringify({ rootPath: root, entries }, null, 2)
		);
	} catch (err) {
		console.error("snapshot failed:", err.message);
	}
};

await snapshot();