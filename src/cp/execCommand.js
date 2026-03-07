import { spawn } from 'child_process';

const execCommand = () => {
  const commandStr = process.argv[2];

  if (!commandStr) {
    console.error('No command provided');
    process.exit(1);
  }

  const [command, ...args] = commandStr.split(' ');

  const child = spawn(command, args, {
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', (code) => {
    process.exit(code);
  });
};

execCommand();
