import { resolve, join } from 'path';
import { pathToFileURL } from 'url';

const dynamic = async () => {
  const pluginName = process.argv[2];
  if (!pluginName) {
    console.log('Plugin not found');
    process.exit(1);
  }

  const pluginPath = resolve(process.cwd(), 'src', 'modules', 'plugins', `${pluginName}.js`);
  
  try {
    const plugin = await import(pathToFileURL(pluginPath).href);
    if (plugin && typeof plugin.run === 'function') {
      console.log(plugin.run());
    } else {
      console.log('Plugin not found');
      process.exit(1);
    }
  } catch (error) {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
