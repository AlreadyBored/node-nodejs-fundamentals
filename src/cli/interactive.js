import readline from 'node:readline';

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'cli> '
  });

  rl.prompt();

  rl.on('line', (line) => {
    const commands = line.trim().toLowerCase().split(/\s+/);

    for (const each of commands) {
      switch (each) {
        case 'uptime':
          console.log(`Uptime: ${process.uptime().toFixed(2)} seconds`);
          break;
        case 'cwd':
          console.log(`Current directory: ${process.cwd()}`);
          break;
        case 'date':
          console.log(new Date().toString());
          break;
        case 'exit':
          rl.close();
          return;
        default:
          console.log(`NoNO, you did smth wrong here: ${each}`);
      }
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\nYou are leaving...');
    rl.close();
  });

  rl.on('close', () => {
    process.exit(0);
  });
};

interactive();
