import readline from "node:readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (input) => {
    const command = input.trim().toLowerCase();

    switch (command) {
      case "":
        rl.prompt();
        break;

      case "exit":
        rl.close();
        break;

      case "cwd":
        console.log(process.cwd());
        rl.prompt();
        break;

      case "date":
        console.log(new Date().toISOString());
        rl.prompt();
        break;

      case "uptime":
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        rl.prompt();
        break;

      default:
        console.log("Unknown command");
        rl.prompt();
    }
  });

  rl.on("SIGINT", () => {
    rl.close();
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
};

interactive();
