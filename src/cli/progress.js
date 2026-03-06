import readline from "node:readline";

const progress = () => {
  const args = process.argv.slice(2);
  const durationIdx = args.indexOf("--duration");
  const intervalIdx = args.indexOf("--interval");
  const lengthIdx = args.indexOf("--length");
  const colorIdx = args.indexOf("--color");

  const duration =
    durationIdx !== -1 && args[durationIdx + 1]
      ? Number(args[durationIdx + 1])
      : 5000;

  const interval =
    intervalIdx !== -1 && args[intervalIdx + 1]
      ? Number(args[intervalIdx + 1])
      : 100;

  const length =
    lengthIdx !== -1 && args[lengthIdx + 1] ? Number(args[lengthIdx + 1]) : 30;

  const color =
    colorIdx !== -1 && args[colorIdx + 1] ? args[colorIdx + 1] : null;

  const isValidColor = color && /^#[0-9A-Fa-f]{6}$/.test(color);
  const validColor = isValidColor ? color : null;

  const r = parseInt(validColor.slice(1, 3), 16);
  const g = parseInt(validColor.slice(3, 5), 16);
  const b = parseInt(validColor.slice(5, 7), 16);

  const ansi = `\x1b[38;2;${r};${g};${b}m`;

  let currStep = 0;
  const totalSteps = duration / interval;

  const timer = setInterval(() => {
    currStep += 1;

    const percentage = Math.floor((currStep / totalSteps) * 100);
    const filledCount = Math.floor((percentage / 100) * length);

    const filled = `${ansi}${"█".repeat(filledCount)}\x1b[0m`;
    const empty = " ".repeat(length - filledCount);
    const bar = `[${filled}${empty}] ${percentage}%`;

    process.stdout.write("\r" + bar);

    if (currStep >= totalSteps) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
