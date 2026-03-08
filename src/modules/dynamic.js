import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dynamic = async () => {
  const pluginName = process.argv[2];

  const pluginPath = join(__dirname, "plugins", `${pluginName}.js`);

  try {
    const plugin = await import(pluginPath);
    console.log(plugin.run());
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
