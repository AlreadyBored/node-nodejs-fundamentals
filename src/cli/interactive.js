import readline from "node:readline";

// Write your code here
// Use readline module for interactive CLI
// Support commands: uptime, cwd, date, exit
// Handle Ctrl+C and unknown commands

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    // Requirement: Display a prompt "> "
    prompt: "> ",
  });

  // Initial prompt display
  rl.prompt();

  rl.on("line", (line) => {
    const command = line.trim().toLowerCase();

    switch (command) {
      case "uptime":
        // Requirement: prints process uptime in seconds (e.g. Uptime: 12.34s)
        process.stdout.write(`Uptime: ${process.uptime().toFixed(2)}s\n`);
        break;

      case "cwd":
        // Requirement: prints the current working directory
        process.stdout.write(`${process.cwd()}\n`);
        break;

      case "date":
        // Requirement: prints the current date and time in ISO format
        process.stdout.write(`${new Date().toISOString()}\n`);
        break;

      case "exit":
        // Requirement: prints "Goodbye!" and terminates
        process.stdout.write("Goodbye!\n");
        rl.close();
        break;

      default:
        // Requirement: On unknown command, print "Unknown command"
        process.stdout.write("Unknown command\n");
        break;
    }

    if (command !== "exit") {
      rl.prompt();
    }
  });

  // Requirement: On Ctrl+C or end of input, print "Goodbye!" and exit
  rl.on("SIGINT", () => {
    process.stdout.write("\nGoodbye!\n");
    rl.close();
  });

  rl.on("close", () => {
    process.exit(0);
  });
};

interactive();
