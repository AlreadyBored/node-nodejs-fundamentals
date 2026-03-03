import { styleText } from "node:util";

const progress = () => {
  const args = process.argv.slice(2);

  const getArgValue = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };

  const duration = Number(getArgValue("--duration")) || 5000;
  const intervalTime = Number(getArgValue("--interval")) || 100;
  const barLength = Number(getArgValue("--length")) || 30;
  const colorHex = getArgValue("--color");

  const hexToColor = (hex) => {
    const ansiColors = {
      black: [0, 0, 0],
      red: [255, 0, 0],
      green: [0, 255, 0],
      yellow: [255, 255, 0],
      blue: [0, 0, 255],
      magenta: [255, 0, 255],
      cyan: [0, 255, 255],
      white: [255, 255, 255],
      gray: [128, 128, 128],
    };
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    let closestColor = null;
    let smallestDistance = Infinity;
    for (const [name, [cr, cg, cb]] of Object.entries(ansiColors)) {
      const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestColor = name;
      }
    }
    return closestColor;
  };

  const colorName = hexToColor(colorHex);

  const totalSteps = Math.ceil(duration / intervalTime);
  const increment = 100 / totalSteps;

  let currentPercent = 0;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    currentPercent = Math.min(100, Math.round(currentStep * increment));

    const filledLength = Math.round((currentPercent / 100) * barLength);
    const emptyLength = barLength - filledLength;

    let filled = "\u2588".repeat(filledLength);
    const empty = " ".repeat(emptyLength);

    if (colorName) {
      try {
        filled = styleText(colorName, filled);
      } catch {
        // invalid style name - ignored
      }
    }

    const line = `[${filled}${empty}] ${currentPercent}%`;

    process.stdout.write("\r\x1b[2K");
    process.stdout.write(line);

    if (currentPercent >= 100) {
      clearInterval(interval);
      process.stdout.write("\nDone!\n");
    }
  }, intervalTime);
};

progress();
