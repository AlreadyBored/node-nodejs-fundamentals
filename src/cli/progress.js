import { parseArgs } from "node:util";

const DEF_DURATION = 5000; // Total duration in milliseconds
const DEF_INTERVAL = 100; // Update interval in milliseconds
const DEF_LENGTH = 30; // Length of the progress bar

const hexToSTDOUTColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `\x1b[38;2;${r};${g};${b}m`;
};

const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

  const args = parseArgs({
    options: {
      duration: { type: "string", default: "" },
      interval: { type: "string", default: "" },
      length: { type: "string", default: "" },
      color: { type: "string", default: "" },
    },
  });

  const { duration, interval, length, color } = {
    duration: parseInt(args.values.duration) || DEF_DURATION,
    interval: parseInt(args.values.interval) || DEF_INTERVAL,
    length: parseInt(args.values.length) || DEF_LENGTH,
    color: args.values.color || "",
  };

  const totalSteps = Math.floor(duration / interval);
  let currentStep = 0;

  const intervalId = setInterval(() => {
    currentStep++;

    const progress = Math.floor((currentStep / totalSteps) * length);
    const bar = "█".repeat(progress) + " ".repeat(length - progress);
    const percentage = Math.floor((currentStep / totalSteps) * 100);
    const progressColor = color ? hexToSTDOUTColor(color) : "";

    process.stdout.write(`\r[${progressColor}${bar}\x1b[0m] ${percentage}%`);

    if (currentStep >= totalSteps) {
      process.stdout.write("\nDone!\n");
      clearInterval(intervalId);
    }
  }, interval);
};

progress();
