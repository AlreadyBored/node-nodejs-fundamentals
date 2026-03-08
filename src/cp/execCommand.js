import { spawn } from 'child_process';

const execCommand = () => {
  const cmdStr = process.argv[2];
  if (!cmdStr) {
    process.exit(1);
  }

  const child = spawn(cmdStr, [], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
    shell: true,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', (code, signal) => {
    process.exit(code !== null ? code : 1);
  });

  child.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
};

execCommand();
