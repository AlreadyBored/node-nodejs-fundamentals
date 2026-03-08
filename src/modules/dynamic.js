import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dynamic = async () => {
  const pluginName = process.argv[2];
  if (!pluginName) {
    console.log('Plugin not found');
    process.exit(1);
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pluginPath = join(__dirname, 'plugins', `${pluginName}.js`);

  try {
    const plugin = await import(pluginPath);
    if (typeof plugin.run === 'function') {
      const result = plugin.run();
      console.log(result);
    } else {
      console.log('Plugin not found');
      process.exit(1);
    }
  } catch {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
