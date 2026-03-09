import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const interactive = () => {
  const rl = createInterface({ 
    input: stdin, 
    output: stdout,
  });

  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', (cmd) => {
    switch(cmd) {
      case 'uptime':
        const processUptime = process.uptime();
        console.log(`Uptime: ${processUptime}`);
        break;
      case 'cwd':
        const currDir = process.cwd();
        console.log(currDir.split('/')[currDir.split('/').length-1]);
        break;
      case 'date':
        const currentDate = new Date();
        const ISOstring = currentDate.toISOString();
        console.log(ISOstring);
        break;
      case 'exit':
        console.log('Goodbye!');
        process.exit(0);
      default:
        console.log('Unknown command');
    }
  })

  rl.on('SIGINT', () => {
    console.log('Goodbye!');
    rl.close();
  });
};

interactive();
