const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

  let percent = 0;
  const totalSteps = 50;
  const barLength = 30;

  const interval = setInterval(() => {
    percent += 100 / totalSteps;

    const filled = Math.round((percent / 100) * barLength);
    const empty = barLength - filled;

    const bar = "█".repeat(filled) + " ".repeat(empty);

    process.stdout.write(`\r[${bar}] ${Math.round(percent)}%`);

    if (percent >= 100) {
      clearInterval(interval);
      process.stdout.write("\n");
    }
  }, 100);
};

progress();
