import { pathToFileURL } from 'url';
import path from 'path';

const dynamic = async () => {
  const pluginName = process.argv[2];

  if (!pluginName) {
    console.error('Usage: node dynamic.js <plugin-name>');
    process.exit(1);
  }

  const pluginPath = path.resolve(
    path.dirname(pathToFileURL(process.argv[1]).pathname),
    'plugins',
    `${pluginName}.js`
  );

  try {
    const module = await import(pathToFileURL(pluginPath).href);
    const result = module.run();
    console.log(result);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Plugin not found');
      process.exit(1);
    }
    throw err;
  }
};

await dynamic();
