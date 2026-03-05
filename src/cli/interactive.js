import readline from 'readline/promises'
import { stdin, stdout } from 'process'

const interactive = () => {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  })
  rl.setPrompt('> ')
  rl.prompt();
  
  rl.on('line', (line) => {
    switch(line) {
      case 'uptime': 
        console.log('Uptime:',process.uptime().toFixed(2));
        break;
      case 'cwd':
        console.log(process.cwd());
        break;
      case 'date': 
        console.log(new Date().toISOString());
        break;
      case 'exit':
        rl.close();
        break;
      default: 
        console.log('Unknown command');
        break;
    }

    rl.prompt();
  })

  rl.on('SIGINT', () => rl.close());

  rl.on('close', () => {
    console.log('Goodbye!')
    process.exit();
  });
};

interactive();
