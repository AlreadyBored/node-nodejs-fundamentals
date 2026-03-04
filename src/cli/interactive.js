import readline from 'node:readline';

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  const formatUptime = (secondsTotal) => {
    const hours = Math.floor(secondsTotal / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = secondsTotal % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  rl.prompt();

  rl.on('line', (line) => {
    const command = line.trim().toLowerCase();

    if (command === 'uptime') {
      const uptimeInSeconds = Math.floor(process.uptime());
      console.log(formatUptime(uptimeInSeconds));
    } else if (command === 'cwd') {
      console.log(process.cwd());
    } else if (command === 'date') {
      console.log(new Date().toString());
    } else if (command === 'exit') {
      rl.close();
      return;
    } else if (command !== '') {
      console.log('Unknown command');
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });

  process.on('SIGINT', () => {
    rl.close();
  });
};

interactive();
