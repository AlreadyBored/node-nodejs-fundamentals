import * as readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const prompt = () => {
    rl.question('> ', (line) => {
      const cmd = (line || '').trim().toLowerCase();

      switch (cmd) {
        case 'uptime':
          console.log(`Uptime: ${(process.uptime()).toFixed(2)}s`);
          break;
        case 'cwd':
          console.log(process.cwd());
          break;
        case 'date':
          console.log(new Date().toISOString());
          break;
        case 'exit':
          console.log('Goodbye!');
          rl.close();
          process.exit(0);
          return;
        case '':
          break;
        default:
          console.log('Unknown command');
      }
      prompt();
    });
  };

  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\nGoodbye!');
    rl.close();
    process.exit(0);
  });

  prompt();
};

interactive();
