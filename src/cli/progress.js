const progress = () => {
  const total = 50;
  const barWidth = 30;
  let step = 0;

  const args = process.argv;
  const colorIdx = args.indexOf('--color');
  let ansiColor = '';
  let ansiReset = '';

  if (colorIdx !== -1 && args[colorIdx + 1]) {
    const hex = args[colorIdx + 1].replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    ansiColor = `\x1b[38;2;${r};${g};${b}m`;
    ansiReset = '\x1b[0m';
  }

  const interval = setInterval(() => {
    step++;
    const percent = Math.round((step / total) * 100);
    const filled = Math.round((step / total) * barWidth);
    const filledBar = '█'.repeat(filled);
    const emptyBar = ' '.repeat(barWidth - filled);
    process.stdout.write(`\r[${ansiColor}${filledBar}${ansiReset}${emptyBar}] ${percent}%`);

    if (step >= total) {
      clearInterval(interval);
      process.stdout.write('\n');
    }
  }, 100);
};

progress();
