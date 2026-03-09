import { fileURLToPath } from 'url';
import path from 'path';

const dynamic = async () => {
  const name = process.argv[2];
  if (!name) {
    console.error('Please provide a plugin name as an argument.');
    process.exit(1);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pluginPath = path.join(__dirname, 'plugins', `${name}.js`);

  try {
    const plugin = await import(pluginPath);
    console.log(plugin.run());
  } catch {
    console.error(`Plugin "${name}" not found.`);
    process.exit(1);
  }
};

await dynamic();
