import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import process from "process";

const rl = readline.createInterface({ input, output });

const interactive = () => {
  rl.on("SIGINT", () => {
    console.log("Goodbye!");
    rl.close();
    process.exit();
  });

  // Handle Ctrl+C and unknown commands
  const ask = () => {
    rl.question("> ", (answer) => {
      switch (answer) {
        case "uptime":
          console.log(`Uptime: ${process.uptime()}s`);
          break;
        case "cwd":
          console.log(`Current directory: ${process.cwd()}`);
          break;
        case "date":
          console.log(`Current date: ${new Date()}`);
          break;
        case "exit":
          console.log("Goodbye!");
          rl.close();
          process.exit();
        default:
          console.log("Unknown command");
      }
      ask();
    }); 
  }

  ask();
};

interactive();
