import {spawn} from "child_process"

const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child

  if (process.argv.length != 3) {
    console.log("command not passed")
    process.exit(1)
  }

  const [command, ...args] = process.argv[2].split(' ');

  const child = spawn(command, args, {
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on('close', (code) => {
    process.exit(code);
  });

  child.on('error', (err) => {
    console.error(`Failed to start child process: ${err.message}`);
    process.exit(1);
  });
};


execCommand();
