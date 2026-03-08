import { spawn } from "child_process";

const execCommand = () => {
  const commandString = process.argv[2];

  if (!commandString) {
    console.error("No command provided");
    process.exit(1);
  }

  const [command, ...args] = commandString.split(" ");

  const child = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: true
  });

  child.stdout.pipe(process.stdout);

  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code);
  });

  child.on("error", (err) => {
    console.error("Failed to start process:", err);
    process.exit(1);
  });
};

execCommand();
