import { spawn } from "node:child_process";

const execCommand = () => {
  const args = process.argv.slice(2);
  const command = args[0];

  const [cmd, ...cmdArgs] = command.split(" ");

  const child = spawn(cmd, cmdArgs, {
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code);
  });
};

execCommand();
