import { spawn } from 'child_process';

const execCommand = () => {
  const str = process.argv[2] ?? '';
  const [cmd, ...args] = str.split(" ").filter(Boolean);

  const cp = spawn(cmd, args, {
    stdio: 'inherit',
  });

  cp.on('close', (code) => process.exit(code ?? 0));
};

execCommand();
