const progress = () => {
  const args = process.argv.slice(2);

  const getArg = (name, defaultValue) => {
    const index = args.indexOf(`--${name}`);
    if (index !== -1 && index + 1 < args.length) {
      const value = Number(args[index + 1]);
      return Number.isFinite(value) ? value : defaultValue;
    }
    return defaultValue;
  };

  const getColor = () => {
    const i = args.indexOf("--color");
    if (i === -1 || i + 1 >= args.length) return null;

    const value = args[i + 1];
    if (!/^#([0-9a-fA-F]{6})$/.test(value)) return null;

    const hex = value.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return { r, g, b };
  };

  const duration = getArg("duration", 5000);
  const interval = getArg("interval", 100);
  const length = getArg("length", 30);
  const color = getColor();

  const steps = Math.max(1, Math.round(duration / interval));

  const paint = (text) => {
    if (!color) return text;
    return `\x1b[38;2;${color.r};${color.g};${color.b}m${text}\x1b[0m`;
  };

  let current = 0;

  const timer = setInterval(() => {
    const percent = Math.min(100, Math.round((current / steps) * 100));

    const filledWidth = Math.round((percent / 100) * length);
    const emptyWidth = length - filledWidth;

    const filled = "█".repeat(filledWidth);
    const empty = " ".repeat(emptyWidth);

    const bar = "[" + paint(filled) + empty + `] ${percent}%`;

    process.stdout.write("\r" + bar);

    current++;

    if (current > steps) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
