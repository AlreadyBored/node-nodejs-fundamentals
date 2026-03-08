const progress = () => {
  let duration = 5000;
  let interval = 100;
  let length = 30;
  let color = null;

  const durIdx = process.argv.indexOf('--duration');
  if (durIdx !== -1 && process.argv[durIdx + 1]) {
    duration = parseInt(process.argv[durIdx + 1], 10) || 5000;
  }
  const intIdx = process.argv.indexOf('--interval');
  if (intIdx !== -1 && process.argv[intIdx + 1]) {
    interval = parseInt(process.argv[intIdx + 1], 10) || 100;
  }
  const lenIdx = process.argv.indexOf('--length');
  if (lenIdx !== -1 && process.argv[lenIdx + 1]) {
    length = parseInt(process.argv[lenIdx + 1], 10) || 30;
  }
  const colorIdx = process.argv.indexOf('--color');
  if (colorIdx !== -1 && process.argv[colorIdx + 1]) {
    const hex = process.argv[colorIdx + 1];
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      color = `\x1b[38;2;${r};${g};${b}m`;
    }
  }

  const reset = '\x1b[0m';
  const start = Date.now();

  const tick = () => {
    const elapsed = Date.now() - start;
    const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
    const filled = Math.floor((pct / 100) * length);
    const empty = length - filled;
    const bar = '█'.repeat(filled) + ' '.repeat(empty);
    const coloredBar = color ? `${color}${'█'.repeat(filled)}${reset}${' '.repeat(empty)}` : bar;
    process.stdout.write(`\r[${coloredBar}] ${pct}%`);
  };

  const id = setInterval(tick, interval);

  setTimeout(() => {
    clearInterval(id);
    process.stdout.write(`\r[${color ? color + '█'.repeat(length) + reset : '█'.repeat(length)}] 100%\n`);
    console.log('Done!');
    process.exit(0);
  }, duration);
};

progress();
