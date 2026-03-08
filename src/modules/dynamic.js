const dynamic = async () => {
  let pluginName = process.argv[2];

  if (!pluginName) {
      console.log('Plugin not found');
      process.exit(1);
  }

  try {
      let path = './plugins/' + pluginName + '.js';
      let plugin = await import(path);
      
      let result = plugin.run();
      console.log(result);
  } catch (error) {
      console.log('Plugin not found');
      process.exit(1);
  }
};

await dynamic();