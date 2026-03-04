import { createInterface } from "readline";

const onCloseHandler = () => {
  console.log("Goodbye!");
  process.exit(0);
};

const interactive = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });
  console.log("Available commands: uptime, cwd, date, exit");
  rl.prompt();

  rl.on("line", (line) => {
    const command = line.trim();

    switch (command) {
      case "uptime":
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;

      case "cwd":
        console.log(process.cwd());
        break;

      case "date":
        console.log(new Date().toISOString());
        break;

      case "exit":
        onCloseHandler();
        break;

      default:
        console.log("Unknown command");
    }

    rl.prompt();
  });

  rl.on("close", onCloseHandler);
  rl.on("SIGINT", onCloseHandler);
};

interactive();
