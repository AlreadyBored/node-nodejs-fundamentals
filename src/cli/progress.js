const getArgs = () => {
  const args = process.argv.slice(2);
  let duration = 5000;
  let interval = 100;
  let length = 30;
  let color = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) {
      duration = parseInt(args[i + 1], 10) || 5000;
    }
    if (args[i] === '--interval' && args[i + 1]) {
      interval = parseInt(args[i + 1], 10) || 100;
    }
    if (args[i] === '--length' && args[i + 1]) {
      length = parseInt(args[i + 1], 10) || 30;
    }
    if (args[i] === '--color' && args[i + 1]) {
      color = args[i + 1];
    }
  }

  return { duration, interval, length, color };
};

const getAnsiColor = (color) => {
  if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
  }
  return null;
};

const progress = () => {
  const { duration, interval, length, color } = getArgs();
  const ansiColor = getAnsiColor(color);

  let elapsed = 0;

  const render = () => {
    const percent = Math.min(100, Math.floor((elapsed / duration) * 100));
    const filledChars = Math.min(length, Math.floor((percent / 100) * length));
    const emptyChars = length - filledChars;

    const filledStr = '█'.repeat(filledChars);
    const emptyStr = ' '.repeat(emptyChars);

    const coloredFilledStr = ansiColor ? `${ansiColor}${filledStr}\x1b[0m` : filledStr;

    process.stdout.write(`\r[${coloredFilledStr}${emptyStr}] ${percent}%`);
  };

  render();

  const timer = setInterval(() => {
    elapsed += interval;
    if (elapsed >= duration) {
      clearInterval(timer);
      elapsed = duration;
      render();
      console.log('');
      console.log('Done!');
    } else {
      render();
    }
  }, interval);
};

progress();
