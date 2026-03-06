const getOptionValue = (optionName, defaultValue) => {
  const index = process.argv.indexOf(optionName);
  if (index !== -1 && process.argv[index + 1]) {
    const value = parseInt(process.argv[index + 1], 10);
    if (!isNaN(value) && value > 0) {
      return value;
    }
  }
  return defaultValue;
};

const getColorValue = () => {
  const index = process.argv.indexOf("--color");
  if (index !== -1 && process.argv[index + 1]) {
    const value = process.argv[index + 1].toLowerCase();
    if (typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      return value;
    }
  }
  return null;
};

const progress = () => {
  const length = getOptionValue("--length", 30);
  const interval = getOptionValue("--interval", 100);
  const duration = getOptionValue("--duration", 5000);
  const color = getColorValue();

  let colorPrefix = "";
  if (color) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    colorPrefix = `\x1b[38;2;${r};${g};${b}m`;
  }

  const renderProgressBar = (percent) => {
    let filled = Math.round((length * percent) / 100);
    let empty = length - filled;
    let filledBar = "█".repeat(filled);
    let emptyBar = " ".repeat(empty);

    if (colorPrefix) {
      filledBar = colorPrefix + filledBar + "\x1b[0m";
    }

    return `[${filledBar}${emptyBar}] ${percent}%`;
  };

  process.stdout.write(renderProgressBar(0));

  const startTime = Date.now();

  const timer = setInterval(() => {
    let elapsed = Date.now() - startTime;
    const percent = Math.min(100, Math.round((elapsed / duration) * 100));
    process.stdout.write("\r" + renderProgressBar(percent));

    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write("\n");
      console.log("Done!");
    }
  }, interval);
};

progress();
