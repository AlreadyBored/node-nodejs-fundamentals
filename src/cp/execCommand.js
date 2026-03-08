import { spawn } from "child_process";
import { pipeline } from "stream";

const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child

  const command = process.argv[2];

  const child = spawn(command, {
    shell: true,
    stdio: "pipe", // wiht 'inherit' it even simplier
    env: process.env,
  });

  pipeline(child.stdout, process.stdout, (err) => {
    if (err) console.error("Stdout pipeline failed", err);
  });
  pipeline(child.stderr, process.stderr, (err) => {
    if (err) console.error("Stderr pipeline failed", err);
  });

  child.on("exit", (code) => {
    child.stdout.destroy();
    child.stderr.destroy();
    process.exit(code);
  });
};

execCommand();
