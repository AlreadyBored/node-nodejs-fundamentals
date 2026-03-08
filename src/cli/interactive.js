import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

const interactive = () => {
  const rl = readline.createInterface({ input, output, prompt: '> ' });

  const handleCommand = (line) => {
    const cmd = line.trim();

    switch (cmd) {
      case 'uptime':
        output.write(`Uptime: ${process.uptime().toFixed(2)}s\n`);
        break;
      case 'cwd':
        output.write(`${process.cwd()}\n`);
        break;
      case 'date':
        output.write(`${new Date().toISOString()}\n`);
        break;
      case 'exit':
        output.write('Goodbye!\n');
        rl.close();
        return;
      default:
        output.write('Unknown command\n');
        break;
    }

    rl.prompt();
  };

  rl.on('line', handleCommand);

  rl.on('SIGINT', () => {
    output.write('Goodbye!\n');
    rl.close();
  });

  rl.on('close', () => {
    process.exit(0);
  });

  rl.prompt();
};

interactive();
