import { parseArgs } from "node:util";

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

  const pluginName = parseArgs({ allowPositionals: true }).positionals[0];

  if (!pluginName) {
    console.error("Plugin not found");
    process.exit(1);
  }

  try {
    const plugin = await import(`./plugins/${pluginName}.js`);

    if (plugin && typeof plugin.run === "function") {
      const result = plugin.run();

      console.log(result);
    } else {
      console.error("No such function 'run()' for plugin:", pluginName);
    }
  } catch (error) {
    console.error("No such plugin:", error.message);
  }
};

await dynamic();
