const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%
  const args = process.argv.slice(2);

  const getArg = (name, defaultValue) => {
    const i = args.indexOf(name);
    if (i !== -1 && args[i + 1]) return args[i + 1];
    return defaultValue;
  };

  const duration = Number(getArg("--duration", 5000));
  const interval = Number(getArg("--interval", 100));
  const length = Number(getArg("--length", 30));
  const colorHex = getArg("--color", null);

  const steps = Math.ceil(duration / interval);
  let step = 0;

  let colorStart = "";
  let colorEnd = "";

  if (colorHex && /^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    colorStart = `\x1b[38;2;${r};${g};${b}m`;
    colorEnd = "\x1b[0m";
  }

  const timer = setInterval(() => {
    step++;

    const percent = Math.min(step / steps, 1);
    const percentValue = Math.floor(percent * 100);

    const filled = Math.round(length * percent);
    const empty = length - filled;

    const filledBar = "█".repeat(filled);
    const emptyBar = " ".repeat(empty);

    const coloredFilled = colorStart
      ? `${colorStart}${filledBar}${colorEnd}`
      : filledBar;

    const bar = `[${coloredFilled}${emptyBar}] ${percentValue}%`;

    process.stdout.write(`\r${bar}`);

    if (percent >= 1) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
