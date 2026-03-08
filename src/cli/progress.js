import { parseArgs } from 'node:util';

const convertRgbToAnsiColor = (hex) => {
  let color = hex;
  if (!hex || !/^#?[0-9a-fA-F]{6}$/.test(hex)) {
    color = '#FFFFFF';
  }
  color = color.replace('#', '');

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  return `\x1b[38;2;${r};${g};${b}m`;
};

const renderProgress = ({ progress, width = 30, color }) => {
  const clampedProgress = Math.min(progress, 1);
  const filled = Math.floor(clampedProgress * width);
  const empty = width - filled;

  const colorCode = convertRgbToAnsiColor(color);
  const resetCode = '\x1b[0m';
  const bar = colorCode + '█'.repeat(filled) + resetCode + ' '.repeat(empty);
  const percent = Math.floor(clampedProgress * 100);

  process.stdout.write(`\r[${bar}] ${percent}%`);
};

const startProgress = ({
  progressUpdateInterval = 100,
  progressDuration = 5000,
  renderFunction,
}) => {
  let i = 0;

  const timer = setInterval(() => {
    i += progressUpdateInterval / progressDuration;
    renderFunction({ progress: i });

    if (i >= 1) {
      clearInterval(timer);
      console.log('\nDone!');
    }
  }, progressUpdateInterval);
};

const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

  const options = {
    duration: {
      type: 'string',
    },
    interval: {
      type: 'string',
    },
    length: {
      type: 'string',
    },
    color: {
      type: 'string',
    },
  };

  const {
    values: { duration, interval, length, color },
  } = parseArgs({ options });

  startProgress({
    progressDuration: Number(duration) || undefined,
    progressUpdateInterval: Number(interval) || undefined,
    renderFunction: (props) =>
      renderProgress({ ...props, width: Number(length) || undefined, color }),
  });
};

progress();
