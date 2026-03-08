import { spawn } from 'node:child_process';

const execCommand = () => {
  const commandArg = process.argv.slice(2).join(' ');

  if (!commandArg) {
    console.error('No command provided');
    process.exit(1);
  }

  const child = spawn(commandArg, {
    shell: true,
    env: process.env,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('exit', (code) => {
    process.exit(code !== null ? code : 1);
  });
};

execCommand();
