import { spawn } from "child_process";

const execCommand = () => {
  const [, , ...args] = process.argv;
  if (args.length === 0) {
    console.error('Usage: node execCommand.js "<command>"');
    process.exit(1);
  }

  const [command, ...commandArgs] = args;

  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code);
  });
};

execCommand();
