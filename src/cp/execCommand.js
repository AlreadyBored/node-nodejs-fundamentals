import { spawn } from 'child_process';

const execCommand = () => {
  const command = process.argv[2];
  if (!command) {
    console.error('Please provide a command as an argument.');
    process.exit(1);
  }

  const child = spawn(command, { shell: true, stdio: 'inherit' });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
};

execCommand();
