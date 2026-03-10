import readline from "readline";

function hexToAnsi(hex) {
  try {
    const match = hex.match(/^#([0-9a-f]{6})$/i);
    if (!match) return "";

    const num = parseInt(match[1], 16);

    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    return `\x1b[38;2;${r};${g};${b}m`;
  } catch {
    console.error("Invalid hex color code. Use format: '#RRGGBB'");
    return "";
  }
}

const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

  const args = process.argv;
  let duration = 5000;
  let interval = 100;
  let length = 30;
  let color = hexToAnsi("#ffffff");
  args.forEach((arg, index) => {
    switch (arg) {
      case "--duration":
        duration = args[index + 1];
        break;
      case "--interval":
        interval = parseInt(args[index + 1]);
        break;
      case "--length":
        length = parseInt(args[index + 1]);
        break;
      case "--color":
        color = hexToAnsi(args[index + 1]);
        break;
      default:
        break;
    }
  });

  let progress = 0;
  const steps = Math.ceil(duration / interval);
  const timer = setInterval(() => {
    progress++;
    const percent = Math.min((progress / steps) * 100, 100);
    const filledLength = Math.round((length * percent) / 100);
    if (progress > steps) {
      const bar = color + "█".repeat(filledLength);
      console.log("\nDone");
      clearInterval(timer);
    }

    const bar =
      color + "█".repeat(filledLength) + " ".repeat(length - filledLength);

    process.stdout.write(`\r[${bar}] ${percent.toFixed(1)}%`);
  }, interval);
};
progress();
