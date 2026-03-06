const progress = () => {
  const args = process.argv.slice(2);
  const getArg = (name, defaultValue) => {
    const index = args.indexOf(name);
    return index !== -1 ? args[index + 1] : defaultValue;
  };

  const duration = parseInt(getArg("--duration", 5000));
  const interval = parseInt(getArg("--interval", 100));
  const length = parseInt(getArg("--length", 30));
  const color = getArg("--color", null);

  let colorprefix = '';

  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    colorprefix = `\x1b[38;2;${r};${g};${b}m`;
  }

  for (let i = 0; i <= length; i++) {
    let percent = Math.round((i / length) * 100);
    let bar = '█'.repeat(i) + ' '.repeat(length - i);
  
    process.stdout.write(`\r[${colorprefix}${bar}\x1b[0m] ${percent}%`);

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, interval);
  }

  process.stdout.write('\nDone!\n');
};

progress();
