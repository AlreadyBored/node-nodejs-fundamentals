import { argv, stdout } from 'node:process';

const parseArgs = () => {
  const args = argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!value && key === '--color') {
      stdout.write(
        'Hint: use quotes or escaping for color, e.g. --color "#00ff00". If you use npm run script add "-- -- color ..."\n'
      );
    }
    if (!value) continue;

    switch (key) {
      case '--duration':
        options.duration = Number(value);
        break;
      case '--interval':
        options.interval = Number(value);
        break;
      case '--length':
        options.length = Number(value);
        break;
      case '--color':
        options.color = value;
        break;
      default:
        break;
    }
  }

  return options;
};

const isValidHexColor = (value) => /^#([0-9a-fA-F]{6})$/.test(value);

const progress = () => {
  const {
    duration = 5000,
    interval = 100,
    length = 30,
    color,
  } = parseArgs();

  const totalSteps = Math.max(1, Math.floor(duration / interval));
  const useColor = typeof color === 'string' && isValidHexColor(color);

  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep += 1;
    const fraction = Math.min(1, currentStep / totalSteps);
    const percent = Math.round(fraction * 100);

    const filledLength = Math.round(length * fraction);
    const emptyLength = length - filledLength;

    const filled = '█'.repeat(filledLength);
    const empty = ' '.repeat(emptyLength);

    let bar = `[${filled}${empty}] ${percent}%`;

    if (useColor && filledLength > 0) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const colorPrefix = `\x1b[38;2;${r};${g};${b}m`;
      const reset = '\x1b[0m';
      const coloredFilled = `${colorPrefix}${filled}${reset}`;
      bar = `[${coloredFilled}${empty}] ${percent}%`;
    }

    stdout.write(`\r${bar}`);

    if (currentStep >= totalSteps) {
      clearInterval(timer);
      stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
