function getArg(name, defaultValue) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return defaultValue;
}

const totalDuration = Number(getArg('duration', 5000));
const interval = Number(getArg('interval', 100));
const barLength = Number(getArg('length', 30));
const color = getArg('color', null);

const progress = () => {
  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += interval;
    let percent = Math.min((elapsed / totalDuration) * 100, 100);
    let filledLength = Math.round((percent / 100) * barLength);
    let bar = '█'.repeat(filledLength) + ' '.repeat(barLength - filledLength);

    let output = `[${bar}] ${Math.round(percent)}%`;
    if (color) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      output = `\x1b[38;2;${r};${g};${b}m${output}\x1b[0m`;
    }

    process.stdout.write(`\r${output}`);
    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();