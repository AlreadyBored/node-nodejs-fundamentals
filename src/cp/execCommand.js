import { spawn } from 'node:child_process';

const execCommand = () => {
  const { argv, exit, env } = process;

  const commandArg = argv[2];

  if (!commandArg) {
    console.error('Command not specified.');
    exit(1);
  }

  const [command, ...args] = commandArg.split(' ');

  const child = spawn(command, args, {
    stdio: 'inherit',
    env,
  });

  child.on('exit', (code) => {
    exit(code);
  });

  child.on('error', (err) => {
    console.error('The command execution failed with an error', err.message);
    exit(1);
  });
};

execCommand();
