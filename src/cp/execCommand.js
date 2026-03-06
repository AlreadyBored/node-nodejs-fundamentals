import { spawn } from 'node:child_process'
import { argv, stderr, stdout } from 'node:process';

const execCommand = () => {
  const [command, ...args] = argv[2].split(' ')

  const child = spawn(command, args, {env: process.env})

  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)

  child.on('close', (code) => process.exit(code))
};

execCommand();
