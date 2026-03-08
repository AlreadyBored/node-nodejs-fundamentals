import path from "path";
import { fileURLToPath } from "url";

const dynamic = async () => {
  const pluginName = process.argv[2];

  try {
    const __filename = fileURLToPath(import.meta.url);
    const pluginPath = path.join(
      path.dirname(__filename),
      "plugins",
      `${pluginName}.js`,
    );
    const plugin = await import(pluginPath);

    const result = plugin.run();
    console.log(result);
  } catch (error) {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
