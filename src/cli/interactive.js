import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands

  const rl = readline.createInterface({ input: stdin, output: stdout });

  rl.prompt();

  rl.on('line', (line) => {
    switch (line) {
      case 'uptime':
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        rl.prompt();
        break;
      case 'cwd':
        console.log(`Directory: ${process.cwd()}`);
        rl.prompt();
        break;
      case 'date':
        console.log(`ISO Date: ${new Date().toISOString()}`);
        rl.prompt();
        break;
      case 'exit':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('Unknown command');
        rl.prompt();
    }
  });
};

interactive();
