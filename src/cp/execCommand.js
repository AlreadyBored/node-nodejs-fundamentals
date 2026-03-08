import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

const getCommandWithArgs = (input) => {
  const endOfCommand = input.trim().indexOf(' ');

  if (endOfCommand === -1) {
    return { command: input, args: [] };
  }
  const command = input.slice(0, endOfCommand);
  const args = input.slice(endOfCommand);
  return { command, args: [args.trim()] };
};

const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child

  const { positionals } = parseArgs({
    allowPositionals: true,
  });

  const { command, args } = getCommandWithArgs(positionals[0]);

  const child = spawn(command, args);

  child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
  });
};

execCommand();
