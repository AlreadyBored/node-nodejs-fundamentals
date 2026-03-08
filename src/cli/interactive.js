import readline from 'readline';
import process from 'process';

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  const startDateMs = Date.now();

  rl.prompt();

  rl.on('line', (ev) => {
    const cmd = ev;

    switch (cmd) {
      case 'uptime':
        const seconds = (Date.now() - startDateMs) / 1000;
        console.log(`Uptime: ${seconds.toFixed(2)}s`);
        break;

      case 'cwd':
        console.log(process.cwd());
        break;

      case 'date':
        console.log(new Date().toISOString());
        break;

      case 'exit':
        rl.close();

      default:
        console.log('Unknown command');
    }


    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });
};

interactive();
