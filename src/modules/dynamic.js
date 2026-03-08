import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

  const args = process.argv;
  const pluginName = args[2];
  
  if (pluginName == null) {
    console.log('Plugin not found');
    process.exit(1);
  }
  
  const pluginPath = path.join(currentDir, 'plugins', pluginName + '.js');
  
  try {
    await fsPromises.access(pluginPath);
  } catch {
    console.log('Plugin not found');
    process.exit(1);
  }
  
  try {
    const plugin = await import(pluginPath);
    // console.log(plugin);
    
    const runResult = plugin.run();
    
    console.log(runResult);
  } catch (err) {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
