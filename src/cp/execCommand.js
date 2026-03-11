import { spawn } from 'node:child_process';

const execCommand = () => {
    // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child
  
  const command = process.argv.slice(2).join(' ').trim();

  if (!command) {
    process.exit(1);
  }

  const child = spawn(command, {
    shell: true,
    env: process.env,
    stdio: 'inherit',
  });

  child.on('error', () => {
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
};

execCommand();
