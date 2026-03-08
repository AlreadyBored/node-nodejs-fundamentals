import { createInterface } from 'node:readline';

const interactive = () => {
  const { stdin, stdout, cwd } = process;

  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: '> '
  });

  rl.prompt();

  rl.on('line', (line) => {
    const command = line.trim();

    switch (command) {
      case 'uptime':
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;
      case 'cwd':
        console.log(`Current directory: ${cwd()}`);
        break;
      case 'date':
        console.log(`Current date and time: ${new Date().toISOString()}`);
        break;
      case 'exit':
        rl.close();
        break;
      default:
        console.log('Unknown command');
    }

    rl.prompt();
  }).on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
};

interactive();
