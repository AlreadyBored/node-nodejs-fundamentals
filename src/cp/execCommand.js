import { spawn } from 'node:child_process';
import { argv } from 'node:process';

const execCommand = () => {
  const args = argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node execCommand.js "command [args...]"');
    process.exit(1);
  }

  const command = args.join(' ');

  const parts = command.split(' ');
  const cmd = parts[0];
  const cmdArgs = parts.slice(1);

  const child = spawn(cmd, cmdArgs, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  child.stdout.pipe(process.stdout);

  child.stderr.pipe(process.stderr);

  child.on('exit', (code) => {
    process.exit(code);
  });

  child.on('error', (error) => {
    console.error('Spawn error:', error.message);
    process.exit(1);
  });
};

execCommand();
