import * as readline from 'node:readline/promises';

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands
  
  const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.setPrompt('>');
rl.prompt();

rl.on('line', (input) => {
  const commands = {
    cwd: () => console.log(process.cwd()),
    date: () => console.log(new Date().toDateString()),
    uptime: () => console.log(process.uptime()),
    exit: () => (console.log('Goodbye!'), process.exit())
  };

  if (commands[input]) {
    commands[input]();
  } else {
    console.log(`Unknown command: ${input}`);
  }
  rl.prompt();
});

rl.on('close', () => {
  process.stdout.write('\n'); 
  console.log('Goodbye!');
  process.exit(0);
});
};


interactive();