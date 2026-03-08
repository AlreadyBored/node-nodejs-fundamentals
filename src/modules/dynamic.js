import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Write your code here
// Accept plugin name as CLI argument
// Dynamically import plugin from plugins/ directory
// Call run() function and print result
// Handle missing plugin case

const dynamic = async () => {
  // We take the plugin name from the command line (e.g., node dynamic.js uppercase)
  const pluginName = process.argv[2];

  // If no name is provided, we just exit
  if (!pluginName) {
    process.exit(1);
  }

  try {
    // 1. Build the absolute path to the plugin file inside the plugins/ folder
    const pluginPath = resolve("src", "modules", "plugins", `${pluginName}.js`);

    // 2. Convert the path to a URL format (required for dynamic imports on some systems)
    const pluginURL = pathToFileURL(pluginPath).href;

    // 3. The Magic: Dynamic Import. This loads the file only when we need it.
    const pluginModule = await import(pluginURL);

    // 4. Execution: Every plugin must have a run() function
    const result = pluginModule.run();

    // 5. Output: Print the string returned by the plugin
    process.stdout.write(`${result}\n`);
  } catch (error) {
    // Requirement: If the file doesn't exist, print "Plugin not found" and exit with code 1
    process.stdout.write("Plugin not found\n");
    process.exit(1);
  }
};

await dynamic();
