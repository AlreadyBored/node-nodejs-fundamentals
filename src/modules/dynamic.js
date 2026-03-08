const pluginName = process.argv[process.argv.length - 1];

const dynamic = async (pluginName) => {
const pluginPath = `./plugins/${pluginName}.js`;
  try {
    const plugin = await import(pluginPath);

    const result = plugin.run();
    console.log(result);
  } catch (err) {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic(pluginName);
