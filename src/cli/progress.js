const progress = () => {
  const args = process.argv.slice(2);

  const getArg = (name, defaultVal) => {
    const idx = args.indexOf(name);
    return idx !== -1 && args[idx + 1] ? Number(args[idx + 1]) : defaultVal;
  };

  const getStringArg = (name, defaultVal) => {
    const idx = args.indexOf(name);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
  };

  const duration = getArg("--duration", 5000);
  const interval = getArg("--interval", 100);
  const length = getArg("--length", 30);
  const colorHex = getStringArg("--color", null);

  let colorStart = "";
  let colorEnd = "";
  if (colorHex && /^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    colorStart = `\x1b[38;2;${r};${g};${b}m`;
    colorEnd = "\x1b[0m";
  }

  const startTime = Date.now();
  const filledChar = "█";
  const emptyChar = " ";

  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const ratio = Math.min(elapsed / duration, 1);
    const percent = Math.round(ratio * 100);
    const filled = Math.round(ratio * length);
    const empty = length - filled;

    const filledStr = filledChar.repeat(filled);
    const emptyStr = emptyChar.repeat(empty);
    const bar = `[${colorStart}${filledStr}${colorEnd}${emptyStr}] ${percent}%`;

    process.stdout.write(`\r${bar}`);

    if (ratio >= 1) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
