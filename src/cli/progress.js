import * as readline from 'node:readline';
import { stdout as output } from 'node:process';

const progress = () => {
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%
  //const rl = readline.createInterface({ input: null, output });

  const durationIndex = process.argv.indexOf('--duration');
  const duration = durationIndex !== -1 ? parseInt(process.argv[durationIndex + 1]) : 5000;
  const intervalIndex = process.argv.indexOf('--interval');
  const interval = intervalIndex !== -1 ? parseInt(process.argv[intervalIndex + 1]) : 100;
  const lengthIndex = process.argv.indexOf('--length');
  const length = lengthIndex !== -1 ? parseInt(process.argv[lengthIndex + 1]) : 30;
  const colorIndex = process.argv.indexOf('--color');
  let color = '';
  if (colorIndex !== -1) {
    const colorArg = process.argv[colorIndex + 1];
    if (/^#[0-9A-Fa-f]{6}$/.test(colorArg)) {
      color = `\x1b[38;2;${parseInt(colorArg.slice(1, 3), 16)};${parseInt(colorArg.slice(3, 5), 16)};${parseInt(colorArg.slice(5, 7), 16)}m`;
    }
  }
  let counter = 0;
  const intervalId = setInterval(() => {
    const filledWidth = Math.floor(counter / 100 * length);
    readline.clearLine(output, 0);
    readline.cursorTo(output, 0);
    const progressBar = '█'.repeat(filledWidth) + ' '.repeat(length - filledWidth);
    counter = Math.min(counter + 100 / (duration / interval), 100);
    output.write(`[${color}${progressBar}\x1b[0m] ${Math.floor(counter)}%`);

    if (counter === 100) {
      output.write('\n');
      output.write('Done!');
      clearInterval(intervalId);
    }
  }, duration / 100);
};

progress();
