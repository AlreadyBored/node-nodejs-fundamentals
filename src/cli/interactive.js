import readline from "readline";
import os from "os";
import process from "process";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log("Welcome to the interactive CLI!");
  rl.prompt();

  rl.on("line", (line) => {
    const command = line.trim();
    switch (command) {
      case "uptime":
        console.log(`System uptime: ${os.uptime()} seconds`);
        break;
      case "cwd":
        console.log(`Current working directory: ${process.cwd()}`);
        break;
      case "date":
        console.log(`Current date and time: ${new Date().toString()}`);
        break;
      case "":
        console.log("Goodbye!");
        rl.close();
        return;
      case "exit":
        console.log("Goodbye!");
        rl.close();
        return;
      default:
        console.log(`Unknown command: ${command}`);
    }
    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });

  rl.on("SIGINT", () => {
    console.log("\nGoodbye!");
    rl.close();
  });
};

interactive();
