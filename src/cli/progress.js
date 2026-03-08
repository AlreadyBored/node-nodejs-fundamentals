const progress = () => {

  const args = process.argv.slice(2);
  
  let duration = 5000;
  let interval = 100;
  let length = 30;
  let percent = 0;
  let color = null;
  let colorCode = null;

  const colorIndex = args.indexOf('--color');
  if (colorIndex !== -1) {
    color = args[colorIndex + 1];
  }
  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    color = null;
  }
  if (color) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    colorCode = `\x1b[38;2;${r};${g};${b}m`;
  }
  
  const durationIndex = args.indexOf('--duration');
  if (durationIndex !== -1) {
    duration = Number(args[durationIndex + 1]);
  }

  const intervalIndex = args.indexOf('--interval');
  if (intervalIndex !== -1) {
    interval = Number(args[intervalIndex + 1]);
  }


  const lengthIndex = args.indexOf('--length');
  if (lengthIndex !== -1) {
    length = Number(args[lengthIndex + 1]);
  }

  const steps = Math.ceil(duration / interval);
  const increment = 100 / steps;
  

  const timer = setInterval(() => {
    percent += increment;
    if (percent > 100) percent = 100;

    const filled = Math.floor((length * percent) / 100);
    const empty = length - filled;
    const filledPart = '█'.repeat(filled);
    const emptyPart = ' '.repeat(empty);
    const coloredFilled = colorCode ? `${colorCode}${filledPart}\x1b[0m`: filledPart;
    const bar = coloredFilled + emptyPart;

    process.stdout.write(`\r[${bar}] ${Math.floor(percent)}%`);
    
    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
