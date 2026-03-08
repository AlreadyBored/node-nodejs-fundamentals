import { stdin, stdout, uptime, cwd } from 'process';
import readline from 'readline/promises'

const interactive = () => {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: '> '
  })

rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();

  switch (input) {
    case 'uptime':
      console.log(`Uptime: ${uptime()}`);
      break;
    case 'cwd':
      console.log(cwd());
      break;
    case 'date':
      let a = new Date();
      let dnt = a.toISOString();
      console.log(dnt)
      break;
    case 'exit':
      console.log('Goodbye');
      rl.close();
    default:
      console.log('Unknown command')
  }

  rl.prompt();
});

rl.on('close', () => console.log('Goodbye!'))
};

interactive();
