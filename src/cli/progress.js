
const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%
  let duration = 5000
  let interval = 100
  let length = 30

  let st = 0;
  let color = '\x1b[37m'

  const colorIdx = process.argv.indexOf("--color")
  if (colorIdx > -1 && colorIdx < process.argv.length - 1) {
    const rgb = hexToRgb(process.argv[colorIdx + 1])
    if (rgb != null) color = rgb
  }
  const durationIdx = process.argv.indexOf("--duration")
  if (durationIdx > -1 && durationIdx < process.argv.length - 1) { 
    duration = parseInt(process.argv[durationIdx + 1])
  }

  const intervalIdx = process.argv.indexOf("--interval")
  if (intervalIdx > -1 && intervalIdx < process.argv.length - 1) { 
    interval = parseInt(process.argv[intervalIdx + 1])
  }

  const lengthIdx = process.argv.indexOf("--length")
  if (lengthIdx > -1 && lengthIdx < process.argv.length - 1) { 
    length = parseInt(process.argv[lengthIdx + 1])
    if (length < 1) {
      length = 30
    }
  }

  setInterval(() => {
      updateProgress(st, duration, length, color);
      st += interval;
  }, interval);

  setTimeout(() => { 
    console.log(`\nDone!`); 
    process.exit(0);
   },  duration + interval)
};
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null
  }
  return `\x1b[38;2;${r};${g};${b}m`;
};

function updateProgress(progress, total, length, color) {
  const percentage = Math.floor((progress / total) * 100);

  const filledBar = `${color}${('█'.repeat((progress / total) * length))}`;
  const emptyBar = ' '.repeat(length - (progress / total) * length);

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write("\x1b[37m[" + filledBar + emptyBar +"\x1b[37m] "+ percentage+ "%");
}

progress();
