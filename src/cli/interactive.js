import readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt('> ');
  rl.prompt();
  rl.on('line', (input) => {
    const command = input.trim();

  switch (command) {
    case 'uptime':
      console.log('Uptime:', process.uptime(), 's');
      break;

    case 'cwd':
      console.log(process.cwd());
      break;

    case 'date':
      console.log(new Date().toISOString());
      break;

    case 'exit':
      rl.close();
      return;

    case '':
      break;

    default:
      console.log('Unknown command');
  }

  rl.prompt();
  });

  rl.on('SIGINT', () => {
    rl.close();
  });

  rl.on('close', () => {
    console.log('Goodbye!');
  process.exit(0);
});
};

interactive();