import readline from 'node:readline';

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  let hasExited = false;

  rl.on('line', (line) => {
    const input = line.trim();
    switch (input) {
      case 'uptime':
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;
      case 'cwd':
        console.log(process.cwd());
        break;
      case 'date':
        console.log(new Date().toISOString());
        break;
      case 'exit':
        hasExited = true;
        console.log('Goodbye!');
        process.exit(0);
        return;
      case '':
        break;
      default:
        console.log('Unknown command');
    }
    rl.prompt();
  }).on('close', () => {
    if (!hasExited) {
      console.log('Goodbye!');
      process.exit(0);
    }
  });
};

interactive();
