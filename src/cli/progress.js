const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%
  const args = process.argv;

  const durationIndex = args.indexOf("--duration");
  const duration =
    durationIndex !== -1 ? Number(args[durationIndex + 1]) : 5000;

  const intervalIndex = args.indexOf("--interval");
  const interval = intervalIndex !== -1 ? Number(args[intervalIndex + 1]) : 100;

  const lengthlIndex = args.indexOf("--length");
  const length = lengthlIndex !== -1 ? Number(args[lengthlIndex + 1]) : 30;

  const colorIndex = args.indexOf("--color");
  const color = colorIndex !== -1 ? args[colorIndex + 1] : "";
  console.log(color);

  const steps = Math.floor(duration / interval);

  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;

    const percent = Math.floor((currentStep / steps) * 100);

    const filled = Math.floor((percent / 100) * length);

    const bar =
      "[" +
      "█".repeat(filled) +
      " ".repeat(length - filled) +
      "] " +
      percent +
      "%";

    process.stdout.write("\r" + bar);

    if (currentStep >= steps) {
      clearInterval(timer);
      console.log("\nDone!");
    }
  }, interval);
};

progress();
