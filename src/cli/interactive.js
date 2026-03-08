import readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  const onExit = () => {
    console.log('Goodbye!');
    process.exit(0);
  };

  rl.prompt();

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
        onExit();
        return;
      default:
        console.log('Unknown command');
    }
    rl.prompt();
  });

  rl.on('SIGINT', onExit);
  rl.on('close', onExit);
};

interactive();