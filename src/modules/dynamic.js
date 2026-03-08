import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case
  if (process.argv.length < 3) {
    console.log('Plugin name should be passed in')
    process.exit(1)
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const modules = await readdir(__dirname + sep + 'plugins');
  const fileName = process.argv[2]

  if (modules.indexOf(fileName + '.js') == -1) {
    console.log('Plugin not found')
    process.exit(1)
  }

  await import(__dirname + sep + 'plugins' + sep + fileName + '.js')
    .then((module) => {
      console.log(module.run());
    })
    .catch((err) => {
      console.error("Failed to load module", err);
    });

};

await dynamic();
