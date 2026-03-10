import readline from "readline";
const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands

  console.log(
    "Help:\n\tuptime — prints process uptime in seconds (e.g. Uptime: 12.34s)\n\tcwd — prints the current working directory\n\tdate — prints the current date and time in ISO format\n\texit — prints Goodbye! and terminates the process",
  );

  const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });
  read.prompt();
  read.on("line", (line) => {
    const command = line.trim();
    switch (command) {
      case "uptime":
        console.log(`\tUptime: ${process.uptime()} seconds`);
        break;
      case "cwd":
        console.log("\t", process.cwd());
        break;
      case "date":
        console.log("\t", new Date());
        break;
      case "exit":
        console.log("\tGoodbye!\n");
        read.close();
        return;
      default:
        console.log("Unknown command");
    }
  });
};

interactive();
