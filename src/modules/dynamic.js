import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { argv, platform } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dynamic = async () => {
  const args = argv.slice(2);
  let pluginName = args[0];

  if (!pluginName) {
    pluginName = 'uppercase';
  }

  const pluginsDir = join(__dirname, 'plugins');
  const pluginPath = join(pluginsDir, `${pluginName}.js`);

  let pluginUrl;
  
  if (platform === 'win32') {
    pluginUrl = `file://${pluginPath.replace(/\\/g, '/')}`;
  } else {
    pluginUrl = pluginPath;
  }

  try {
    const pluginModule = await import(pluginUrl);
    
    if (typeof pluginModule.run === 'function') {
      const result = await pluginModule.run();
      console.log(result);
    } else {
      console.error('Plugin does not export run() function');
      process.exit(1);
    }
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
      console.log('Plugin not found');
      process.exit(1);
    } else {
      console.error('Plugin error:', error.message);
      process.exit(1);
    }
  }
};

await dynamic();
