import readline from "readline";

const interactive = () => {
  const currentReadLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  currentReadLine.setPrompt("> ");
  currentReadLine.prompt();

  currentReadLine.on("line", (line) => {
    const cmd = line.trim();

    if (cmd === "uptime") {
      console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
    } else if (cmd === "cwd") {
      console.log(process.cwd());
    } else if (cmd === "date") {
      console.log(new Date().toISOString());
    } else if (cmd === "exit") {
      console.log("Goodbye!");
      process.exit(0);
    } else {
      console.log("Unknown command");
    }

    currentReadLine.prompt();
  });

  currentReadLine.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
};

interactive();
