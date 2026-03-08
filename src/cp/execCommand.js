import { spawn } from 'child_process';

const execCommand = () => {
  const commandStr = process.argv[2];
  if (!commandStr) {
    console.error('No command provided');
    process.exit(1);
  }

  const [command, ...args] = commandStr.split(' ');

  const child = spawn(command, args, {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: process.env,
    shell: true, 
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
};

execCommand();