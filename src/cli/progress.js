const progress = () => {
  function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {
      duration: 5000,
      interval: 100,
      length: 30,
      color: null,
    };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "--duration") opts.duration = Number(args[++i]);
      else if (arg === "--interval") opts.interval = Number(args[++i]);
      else if (arg === "--length") opts.length = Number(args[++i]);
      else if (arg === "--color") opts.color = args[++i];
    }
    return opts;
  }

  function hexToAnsi(hex) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return null;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
  }

  function runProgress({ duration, interval, length, color }) {
    const totalSteps = Math.ceil(duration / interval);
    let step = 0;
    const ansiColor = color ? hexToAnsi(color) : null;
    const timer = setInterval(() => {
      step++;
      const percent = Math.min(step / totalSteps, 1);
      const percentValue = Math.floor(percent * 100);
      const filledLength = Math.round(length * percent);
      const emptyLength = length - filledLength;
      let filled = "█".repeat(filledLength);
      const empty = " ".repeat(emptyLength);
      if (ansiColor) {
        filled = `${ansiColor}${filled}\x1b[0m`;
      }
      const bar = `[${filled}${empty}] ${percentValue}%`;
      process.stdout.write(`\r${bar}`);
      if (step >= totalSteps) {
        clearInterval(timer);
        process.stdout.write("\nDone!\n");
      }
    }, interval);
  }

  const options = parseArgs();
  runProgress(options);
};

progress();
