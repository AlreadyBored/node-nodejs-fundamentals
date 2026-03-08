function getArg(name, defaultValue, args) {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] !== undefined ? args[index + 1] : defaultValue;
}

function hexToRgb(hex) {
  if (!hex) return null;
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  const match = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function colorize(text, rgb) {
  if (!rgb) return text;
  return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}\x1b[0m`;
}

const progress = () => {
  const args = process.argv.slice(2);

  const duration = parseInt(getArg('duration', '5000', args), 10);
  const interval = parseInt(getArg('interval', '100', args), 10);
  const length = parseInt(getArg('length', '30', args), 10);
  const colorArg = getArg('color', null, args);

  const rgb = hexToRgb(colorArg);

  const steps = Math.floor(duration / interval);
  let current = 0;

  const timer = setInterval(() => {
    current++;
    const progress = Math.min(current / steps, 1);
    const percent = Math.round(progress * 100);
    const filled = Math.round(progress * length);
    const empty = length - filled;

    const filledStr = colorize('█'.repeat(filled), rgb);
    const emptyStr = ' '.repeat(empty);
    const bar = `[${filledStr}${emptyStr}] ${percent}%`;

    process.stdout.write(`\r${bar}`);

    if (current >= steps) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
