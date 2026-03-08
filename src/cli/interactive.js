import readline from 'readline';


const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands

  const rl = readline.createInterface(
    process.stdin, process.stdout);
  const startTime = performance.now();
  rl.setPrompt(`>`);
  rl.prompt();
  rl.on('line', (cmd) => {
    switch (cmd) {
      case 'pwd':
        console.log(process.cwd())
        break;
      case 'uptime':
        upTime(startTime)
        break;
      case 'date':
        printDate()
        break;
      case 'exit':
        process.exit(0)
      default:
        console.log(`Unknown command`)
    }
  });
};

function printDate() {
  const now = new Date();
  console.log(now.toISOString())
}

function upTime (startTime) {
  const endTime = performance.now();
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`Uptime: ${elapsedTime}`)
}

interactive();

process.on('exit', (code) => {
  console.log(`Goodbye!`)
});
