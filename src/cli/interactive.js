import readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', (line) => {
    const cmd = line.trim();
    if (cmd === 'uptime') {
      console.log(process.uptime());
    } else if (cmd === 'cwd') {
      console.log(process.cwd());
    } else if (cmd === 'date') {
      console.log(new Date().toISOString());
    } else if (cmd === 'exit') {
      process.exit(0);
    } else {
      console.log(`Unknown command: ${cmd}`);
    }
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
};

interactive();
