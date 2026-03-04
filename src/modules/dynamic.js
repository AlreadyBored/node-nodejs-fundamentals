import path from "path";
import { fileURLToPath } from "url";
import process from "process";

const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log("Plugin not found");
    process.exit(1);
  }

  try {
    const fileUrl = fileURLToPath(import.meta.url);
    const appPath = path.dirname(fileUrl);

    const pluginPath = path.resolve(appPath, "plugins", `${pluginName}.js`);
    const plugin = await import(pluginPath);

    if (typeof plugin.run === "function") {
      const result = plugin.run();
      console.log(result);
    } else {
      console.log("Plugin not found");
      process.exit(1);
    }
  } catch (error) {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
