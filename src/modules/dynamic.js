import path from 'path';
import { pathToFileURL } from 'url';

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case
  const args = process.argv.slice(2);
  const pluginName = args[0];

  if (!pluginName) {
    console.log('Plugin not found');
    process.exit(1);
  }

  try {
    const pluginPath = path.join(process.cwd(), 'src/modules/plugins', `${pluginName}.js`);
    const pluginUrl = pathToFileURL(pluginPath).href;

    const plugin = await import(pluginUrl);

    const result = plugin.run();
    console.log(result);
  } catch {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
