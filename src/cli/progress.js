const progress = () => {
  // recognize the args
  const checkCliArg = (reqArg, defVal) => {
    let newVal = defVal;
    let argIndex = process.argv.findIndex((cliArg) => cliArg === reqArg);
    if (argIndex > 1) {
      if (process.argv[argIndex + 1]) {
        newVal = process.argv[argIndex + 1];
      }
    }
    return newVal;
  };

  const startTime = Date.now(); // check start time

  const duration = Number(checkCliArg("--duration", "5000")); //update default arguments from CLI
  const interval = Number(checkCliArg("--interval", "100"));
  const barLength = Number(checkCliArg("--length", "30"));
  const colorArg = checkCliArg("--color", undefined);

  var setColor = "\x1b[0m";

  // if color arg provided we calculate colors, otherwise not
  if (colorArg) {
    let red = parseInt(colorArg.slice(1, 3), 16);
    let green = parseInt(colorArg.slice(3, 5), 16);
    let blue = parseInt(colorArg.slice(5), 16);

    //console.log(red, green, blue);
    setColor = "\x1b[38;2;" + red + ";" + green + ";" + blue + "m";
  }

  console.log;

  /*
  console.log(
    "Duration: " +
      duration +
      ", Interval: " +
      interval +
      ", Length: " +
      barLength +
      ", Color: " +
      color,
  );
  */

  // set interval timer with ticks

  const intervalId = setInterval(() => {
    // each step calculate % = current time minus start time div total length, but not exceeding 100%
    let passedTime = Date.now() - startTime;
    let progressCompleted = Math.min(passedTime / duration, 1);
    let percentCompleted = Math.floor(progressCompleted * 100);
    let filledLength = Math.floor(progressCompleted * barLength);

    // build a line of [ color spaces * % + rest without color ], write %
    let progressBarString =
      "[" +
      setColor +
      "█".repeat(filledLength) +
      "\x1b[0m" +
      " ".repeat(barLength - filledLength) +
      "] " +
      percentCompleted +
      "%";
    // output the line, put \r in advance
    process.stdout.write("\r" + progressBarString);

    // after 100% stop the interval and Done!
    if (progressCompleted === 1) {
      clearInterval(intervalId);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
