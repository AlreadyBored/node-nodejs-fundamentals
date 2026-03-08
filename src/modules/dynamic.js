const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

  const pluginName = process.argv[2];
  if (!pluginName) {
    console.log("Plugin name not provided");
    process.exit(1);
  }

  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    const result = await plugin.run();
    console.log(result);
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
