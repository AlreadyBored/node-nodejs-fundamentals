import { spawn } from 'child_process';

const execCommand = () => {
  const commandLine = process.argv[2];
  if (!commandLine) {
    console.error('No command provided');
    process.exit(1);
  }

  const [cmd, ...args] = commandLine.split(' ');

  const child = spawn(cmd, args, {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
};

execCommand();
