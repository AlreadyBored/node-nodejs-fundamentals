// Write your code here
// Simulate progress bar from 0% to 100% over ~5 seconds
// Update in place using \r every 100ms
// Format: [████████████████████          ] 67%
//
const progress = () => {
  const args = process.argv;

  // Helper function to get argument values or return a default
  const getArg = (flag, defaultValue) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
  };

  // Parsing arguments with their default values
  const duration = parseInt(getArg("--duration", "5000"));
  const interval = parseInt(getArg("--interval", "100"));
  const length = parseInt(getArg("--length", "30"));
  const hexColor = getArg("--color", null);

  // Helper to convert #RRGGBB to ANSI escape code for 24-bit color
  const getAnsiColor = (hex) => {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
  };

  const colorStart = getAnsiColor(hexColor);
  const colorReset = "\x1b[0m";

  let percentage = 0;
  const increment = 100 / (duration / interval);

  const timer = setInterval(() => {
    percentage += increment;
    if (percentage > 100) percentage = 100;

    const filledLength = Math.floor((percentage / 100) * length);
    const emptyLength = length - filledLength;

    const filledPart = "█".repeat(filledLength);
    const emptyPart = " ".repeat(emptyLength);

    // Building the bar: Apply color only to the filled part if color exists
    const formattedBar = `${colorStart}${filledPart}${colorReset}${emptyPart}`;

    process.stdout.write(`\r[${formattedBar}] ${Math.round(percentage)}%`);

    if (percentage >= 100) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
