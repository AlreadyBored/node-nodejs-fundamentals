const dynamic = async () => {
  const { argv, exit } = process;

  const pluginName = argv[2];

  if (!pluginName) {
    console.error('The plugin name is not specified.');
    exit(1);
  }

  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    const result = await plugin.run();

    console.log(result);
  } catch (error) {
    console.error('Plugin with this name not found.');
    exit(1);
  }
};

await dynamic();
