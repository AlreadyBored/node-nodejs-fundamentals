const progress = () => {
  const args = process.argv.slice(2);

  const getArg = (name, defaultValue) => {
    const idx = args.indexOf(name);
    return idx !== -1 && args[idx + 1] ? Number(args[idx + 1]) : defaultValue;
  };

  const duration = getArg('--duration', 5000);
  const interval = getArg('--interval', 100);
  const length = getArg('--length', 30);

  const colorIdx = args.indexOf('--color');
  const colorArg = colorIdx !== -1 ? args[colorIdx + 1] : null;

  let colorStart = '';
  let colorEnd = '';

  if (colorArg && /^#[0-9a-fA-F]{6}$/.test(colorArg)) {
    const r = parseInt(colorArg.slice(1, 3), 16);
    const g = parseInt(colorArg.slice(3, 5), 16);
    const b = parseInt(colorArg.slice(5, 7), 16);
    colorStart = `\x1b[38;2;${r};${g};${b}m`;
    colorEnd = '\x1b[0m';
  }

  const totalSteps = Math.ceil(duration / interval);
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const percent = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
    const filled = Math.round((percent / 100) * length);
    const empty = length - filled;

    const filledBar = '█'.repeat(filled);
    const emptyBar = ' '.repeat(empty);
    const bar = `[${colorStart}${filledBar}${colorEnd}${emptyBar}] ${percent}%`;

    process.stdout.write(`\r${bar}`);

    if (currentStep >= totalSteps) {
      clearInterval(timer);
      console.log('\nDone!');
    }
  }, interval);
};

progress();
