import { spawn } from "node:child_process";

const execCommand = () => {
  const commandString = process.argv[2];

  if (!commandString) {
    console.error("No command provided");
    process.exit(1);
  }

  const child = spawn(commandString, [], {
    env: process.env,
    shell: true,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code);
  });
};

execCommand();
