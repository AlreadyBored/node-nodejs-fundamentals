const progress = () => {
  let duration = 5000;
  let interval = 100;
  let length = 30;
  let color = null;

  const durationIndex = process.argv.indexOf('--duration');
  if (durationIndex !== -1 && process.argv[durationIndex + 1]) {
    duration = parseInt(process.argv[durationIndex + 1]);
  }

  const intervalIndex = process.argv.indexOf('--interval');
  if (intervalIndex !== -1 && process.argv[intervalIndex + 1]) {
    interval = parseInt(process.argv[intervalIndex + 1]);
  }

  const lengthIndex = process.argv.indexOf('--length');
  if (lengthIndex !== -1 && process.argv[lengthIndex + 1]) {
    length = parseInt(process.argv[lengthIndex + 1]);
  }

  const colorIndex = process.argv.indexOf('--color');
  if (colorIndex !== -1 && process.argv[colorIndex + 1]) {
    const rawColor = process.argv[colorIndex + 1];
    if (/^#[0-9A-Fa-f]{6}$/.test(rawColor)) {
      const r = parseInt(rawColor.slice(1, 3), 16);
      const g = parseInt(rawColor.slice(3, 5), 16);
      const b = parseInt(rawColor.slice(5, 7), 16);
      color = `\x1b[38;2;${r};${g};${b}m`;
    }
  }

  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += interval;
    if (elapsed > duration) elapsed = duration;

    const percent = Math.floor((elapsed / duration) * 100);
    const filledLength = Math.floor((percent / 100) * length);
    const emptyLength = length - filledLength;

    const filledPart = '█'.repeat(filledLength);
    const emptyPart = ' '.repeat(emptyLength);

    const coloredFilledPart = color ? `${color}${filledPart}\x1b[0m` : filledPart;

    process.stdout.write(`\r[${coloredFilledPart}${emptyPart}] ${percent}%`);

    if (elapsed >= duration) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
