import readline from 'readline';

const commands = {
  uptime: () => {
    console.log(`Uptime: ${process.uptime()}s`);
  },
  cwd: () => {
    console.log(`Current working directory: ${process.cwd()}`);
  },
  date: () => {
    console.log(`Current date and time: ${new Date().toISOString()}`);
  },
  exit: (rlEntity) => {
    console.log('Goodbye!');
    rlEntity.close();
  }
};

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  })

  rl.prompt();

  rl.on('line', (input) => {
    const command = input.trim().toLowerCase();
    if (commands[command]) {
      commands[command](rl);
    } else {
      console.log(`\nUnknown command`);
    }
  });

  rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    rl.close();
  });
}

interactive();
