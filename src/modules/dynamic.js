const dynamic = async () => {
  const pluginName = process.argv[2];
  if (!pluginName) {
    console.log("Plugin not found");
    process.exit(1);
  }

  try {
    const pluginModule = await import(`./plugins/${pluginName}.js`);

    if (typeof pluginModule.run !== "function") {
      throw new Error("Invalid plugin");
    }

    console.log(pluginModule.run());
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
