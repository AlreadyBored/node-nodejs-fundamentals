const dynamic = async () => {
  const plugin = process.argv[2];
  const pluginPath = `./plugins/${plugin}.js`;
  try {
    const pluginModule = await import(pluginPath);
    const result = pluginModule.run();
    console.log(result);
  } catch (error) {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
