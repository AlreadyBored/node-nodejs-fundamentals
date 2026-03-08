import readline from "node:readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  // 1. A callback function
  const checkLine = (usersAnswer) => {
    let trimmedAnswer = usersAnswer.trim(); // 1.1 trimming a line
    switch (
      trimmedAnswer // 1.2 make a switch for actions in case of various line values
    ) {
      case "uptime":
        console.log("Uptime: " + process.uptime().toFixed(2) + "s");
        rl.prompt();
        break;
      case "cwd":
        console.log(process.cwd());
        rl.prompt();
        break;
      case "date":
        let curDate = new Date().toISOString();
        console.log(curDate);
        rl.prompt();
        break;
      case "exit":
        rl.close();
        break;
      default:
        console.log("Unknown command");
        rl.prompt();
    }
  };

  // 2. Events
  rl.on("line", (input) => checkLine(input));
  rl.on("SIGINT", () => rl.close());
  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });

  // 3. prompt
  //console.log("Commands: uptime, cwd, date, exit, ctrl+c");
  rl.prompt();
};

interactive();
