import { spawn } from "node:child_process";

// Write your code here
// Take command from CLI argument
// Spawn child process
// Pipe child stdout/stderr to parent stdout/stderr
// Pass environment variables
// Exit with same code as child

const execCommand = () => {
  // 1. Get the command string from the arguments
  const commandArg = process.argv[2];

  if (!commandArg) {
    process.stderr.write("Please provide a command string, (e.g., 'ls -la')\n");
    process.exit(1);
  }

  // 2. Parse the command and its arguments
  // Example: "ls -la" -> command: "ls", args: ["-la"]
  const [command, ...args] = commandArg.split(" ");

  // 3. Spawn the child process
  // We pass 'process.env' so the child has the same environment variables
  const child = spawn(command, args, {
    env: process.env,
    shell: true, // Use shell to correctly parse strings on Mac/Windows
  });

  // 4. Pipe the outputs
  // This connects the child's mouth (stdout) to the parent's mouth (stdout)
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  //

  // 5. Handle the exit
  child.on("close", (code) => {
    // Requirement: parent process exits with the same exit code
    process.exit(code);
  });

  // Handle errors if the command doesn't exist
  child.on("error", (err) => {
    process.stderr.write(`Failed to start process: ${err.message}\n`);
    process.exit(1);
  });
};

execCommand();
