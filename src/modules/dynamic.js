import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const dynamic = async () => {
  const args = process.argv.slice(2);
  const plugin = args[args.length - 1];

  const pluginPath = path.join(__dirname, "plugins", `${plugin}.js`);

  try {
    const module = await import(pluginPath);
    console.log(module.run());
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
