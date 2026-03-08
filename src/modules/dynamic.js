import { parseArgs } from 'node:util';

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

  const { positionals } = parseArgs({
    allowPositionals: true,
  });

  try {
    const module = await import(`./plugins/${positionals[0]}.js`);

    const result = module.run();

    console.log(result);
  } catch {
    console.log('Plugin not found');
    process.exit(1);
  }
};
await dynamic();
