import readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  const exitHandler = () => {
    console.log('Goodbye!');
    rl.close();
    process.exit(0);
  };

  rl.on('SIGINT', exitHandler);
  rl.on('close', exitHandler);

  rl.prompt();

  rl.on('line', (line) => {
    const cmd = line.trim();
    switch (cmd) {
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
        exitHandler();
        return;
      default:
        console.log('Unknown command');
    }
    rl.prompt();
  });
};

interactive();