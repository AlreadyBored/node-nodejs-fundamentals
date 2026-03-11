const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.error('Plugin not found');
    process.exit(1);
  }

  try {
    const pluginPath = new URL(`./plugins/${pluginName}.js`, import.meta.url).href;
    const pluginModule = await import(pluginPath);
    const result = pluginModule.run();
    console.log(result);
  } catch (error) {
    if (error && (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'ERR_UNSUPPORTED_DIR_IMPORT')) {
      console.error('Plugin not found');
      process.exit(1);
    }

    throw error;
  }
};

await dynamic();
