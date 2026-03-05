import { stdout } from 'process';

const getParamValue = (name) => {
  const args = process.argv;
  const index = args.indexOf(name);

  if (index === -1) {
    return null;
  }

  const value = args[index + 1];
  return value !== undefined ? value : null;
};

const getPositiveIntParam = (name) => {
  const rawValue = getParamValue(name);

  if (rawValue === null) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseHexColor = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return null;
  }

  return {
    r: Number.parseInt(value.slice(1, 3), 16),
    g: Number.parseInt(value.slice(3, 5), 16),
    b: Number.parseInt(value.slice(5, 7), 16),
  };
};

const getColoredString = (string, rgbColor) => {
  if (!rgbColor || string.length === 0) {
    return string;
  }

  return `\x1b[38;2;${rgbColor.r};${rgbColor.g};${rgbColor.b}m${string}\x1b[0m`;
};

const formatProgressBar = (length, percent, rgbColor) => {
  const filledLength = Math.round((percent / 100) * length);
  const filled = '█'.repeat(filledLength);
  const empty = ' '.repeat(length - filledLength);

  return `[${getColoredString(filled, rgbColor)}${empty}] ${percent.toFixed(0)}%`;
};

const progress = () => {
  const length = getPositiveIntParam('--length') ?? 30;
  const duration = getPositiveIntParam('--duration') ?? 5000;
  const interval = getPositiveIntParam('--interval') ?? 100;
  const rgbColor = parseHexColor(getParamValue('--color'));

  const start = Date.now();

  const render = () => {
    const elapsed = Date.now() - start;
    const percent = Math.min((elapsed / duration) * 100, 100);
    stdout.write(`\r${formatProgressBar(length, percent, rgbColor)}`);

    if (percent >= 100) {
      clearInterval(timer);
      stdout.write('\nDone!\n');
    }
  };

  render();
  const timer = setInterval(render, interval);
};

progress();
