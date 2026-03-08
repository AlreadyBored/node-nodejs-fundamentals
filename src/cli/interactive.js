import readline from "node:readline";

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    const command = input.trim();

    switch (command) {
      case "uptime":
        console.log(process.uptime());
        break;

      case "cwd":
        console.log(process.cwd());
        break;

      case "date":
        console.log(new Date().toString());
        break;

      case "exit":
        rl.close();
        return;

      default:
        console.log("Unknown command");
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });

  process.on("SIGINT", () => {
    rl.close();
  });
};

interactive();
