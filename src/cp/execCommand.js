import { spawn } from 'child_process';

const execCommand = () => {
  const [command, ...args] = process.argv[2].split(' ');

  const child = spawn(command, args, {
    env: process.env,
  })
  
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
  child.on('exit', (code) => {
    process.exit(code);
});

};

execCommand();
