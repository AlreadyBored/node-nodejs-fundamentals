import fs from 'fs/promises';

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case
  
  const pluginFolderRoot = 'src/modules/plugins'
  const ext = '.js';
  const pluginName = process.argv[2] + ext;

  const filesInFolder = await fs.readdir(pluginFolderRoot)
  if (filesInFolder.includes(pluginName)) {
    const { run } = await import(`./plugins/${pluginName}`);
    console.log(run());
  } else {
    console.log('Plugin not found');
    process.exit(1); 
  }
  }

await dynamic();
