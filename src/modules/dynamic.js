const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log('Plugin not found');
    process.exit(1);
  }

  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    if (plugin && typeof plugin.run === 'function') {
      console.log(plugin.run());
    } else {
      console.log('Plugin not found');
      process.exit(1);
    }
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('Plugin not found');
      process.exit(1);
    } else {
      console.log('Plugin not found');
      process.exit(1);
    }
  }
};

await dynamic();
