import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const questionUser = (rl) => {
  rl.question('> ').then((command) => {
    console.log('> ' + command);
    switch (command) {
      case 'uptime':
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;
      case 'cwd':
        console.log(`Current working directory: ${process.cwd()}`);
        break;
      case 'date':
        console.log(`Current date and time: ${new Date().toISOString()}`);
        break;
      case 'exit':
        rl.close();
      default:
        console.log('Unknown command');
    }
    rl.write('\n');
  });
}

const interactive = () => {
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands

  const rl = readline.createInterface({ input, output });

  questionUser(rl);
  rl.on('line', () => {
    questionUser(rl);
  });

  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });
}

interactive();
