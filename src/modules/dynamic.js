import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log("Plugin not found");
    process.exit(1);
  }

  const pluginPath = join(__dirname, "plugins", `${pluginName}.js`);

  try {
    const plugin = await import(pathToFileURL(pluginPath));
    const result = plugin.run();
    console.log(result);
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
