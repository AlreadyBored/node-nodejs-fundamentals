import { createInterface } from "node:readline/promises";

const interactive = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.prompt();

  rl.on("line", (line) => {
    switch (line.trim()) {
      case "uptime":
        console.log(`uptime: ${process.uptime().toFixed(2)}s`);
        rl.prompt();
        break;

      case "cwd":
        console.log(process.cwd());
        rl.prompt();
        break;

      case "date":
        console.log(new Date().toISOString());
        rl.prompt();
        break;

      case "exit":
        rl.close();
        break;

      default:
        console.log("Unknown command");
        rl.prompt();
        break;
    }

  });

  rl.on("close", () => {
    console.log("Goodbye!");
  });
};

interactive();
