const progress = () => {
  const args = process.argv.slice(2);

  const getArgValue = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const duration = parseInt(getArgValue("--duration")) || 5000;
  const intervalTime = parseInt(getArgValue("--interval")) || 100;
  const barLength = parseInt(getArgValue("--length")) || 30;
  const colorHex = getArgValue("--color");

  const totalSteps = Math.ceil(duration / intervalTime);
  const increment = 100 / totalSteps;

  let currentPercent = 0;
  let currentStep = 0;

  const isValidHex = (hex) => /^#([0-9A-Fa-f]{6})$/.test(hex);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const interval = setInterval(() => {
    currentStep++;
    currentPercent = Math.min(100, Math.round(currentStep * increment));

    const filledLength = Math.round((currentPercent / 100) * barLength);

    let filledBar = "\u2588".repeat(filledLength);
    const emptyBar = " ".repeat(barLength - filledLength);

    if (colorHex && isValidHex(colorHex)) {
      const { r, g, b } = hexToRgb(colorHex);
      filledBar = `\x1b[38;2;${r};${g};${b}m${filledBar}\x1b[0m`;
    }

    process.stdout.write(`\r[${filledBar}${emptyBar}] ${currentPercent}%`);

    if (currentPercent >= 100) {
      clearInterval(interval);
      process.stdout.write("\nDone!\n");
    }
  }, intervalTime);
};

progress();
