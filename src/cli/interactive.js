import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

async function runUserInputAsking() {
  let isRunning = true;

  while (isRunning) {
    try {
      const command = await rl.question("> ");
      switch (command.trim()) {
        case "uptime":
          console.log(`Uptime: ${process.uptime()} seconds`);
          break;
        case "cwd":
          console.log(process.cwd());
          break;
        case "date":
          console.log(new Date().toISOString());
          break;
        case "exit":
          isRunning = false;
          rl.close();
          handleShutdown();
          break;
        default:
          console.log("Unknown command");
      }
    } catch (error) {
      // Unexpected, but Ctrl+C will trigger error, so we handle it gracefully
      rl.close();
      handleShutdown();
    }
  }

  handleShutdown();
}

function handleShutdown() {
  console.log("\nGoodbye!");
  process.exit(0);
}

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands
  runUserInputAsking();
};

interactive();
