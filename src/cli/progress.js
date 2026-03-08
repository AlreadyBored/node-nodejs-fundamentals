const parseArg = (name, def) => {
  const idx = process.argv.indexOf('--' + name);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return def;
};

const isValidHex = (hex) => /^#[0-9a-fA-F]{6}$/.test(hex);

const progress = () => {
  const duration = Number(parseArg('duration', 5000));
  const interval = Number(parseArg('interval', 100));
  const length = Number(parseArg('length', 30));
  const color = parseArg('color', null);
  const useColor = color && isValidHex(color);
  let percent = 0;
  let elapsed = 0;
  const totalSteps = Math.ceil(duration / interval);

  const colorStart = useColor
    ? `\x1b[38;2;${parseInt(color.slice(1, 3), 16)};${parseInt(color.slice(3, 5), 16)};${parseInt(color.slice(5, 7), 16)}m`
    : '';
  const colorEnd = useColor ? '\x1b[0m' : '';

  const timer = setInterval(() => {
    percent = Math.min(1, elapsed / duration);
    const filled = Math.round(length * percent);
    const empty = length - filled;
    const bar =
      '[' +
      (useColor ? colorStart : '') +
      '█'.repeat(filled) +
      (useColor ? colorEnd : '') +
      ' '.repeat(empty) +
      `] ${Math.round(percent * 100)}%`;
    process.stdout.write('\r' + bar);
    elapsed += interval;
    if (percent >= 1) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();