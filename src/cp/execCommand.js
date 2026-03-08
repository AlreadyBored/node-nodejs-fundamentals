import { spawn } from 'child_process';

const execCommand = () => {
  const cmdStr = process.argv[2];
  if (!cmdStr) {
    console.error('No command provided');
    process.exit(1);
  }
  // Split command into executable and args
  const [command, ...args] = cmdStr.match(/(?:[^\s"]+|"[^"]*")+/g).map(s => s.replace(/^"|"$/g, ''));
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32' // for Windows compatibility
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
};

execCommand();