import readline from "node:readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (input) => {
    const command = input.trim();
    if (command == "uptime") {
      console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
    } else if (command == "cwd") {
      console.log(process.cwd());
    } else if (command == "date") {
      console.log(`${new Date().toISOString()}`);
    } else if (command == "exit") {
      rl.close();
    } else {
      console.log("Unknown command");
    }
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
};

interactive();
