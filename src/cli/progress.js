const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

  const args = process.argv;

  let duration = 5000;
  let interval = 100;
  let length = 30;
  let color = '';

  for (let i = 2; i < args.length; i += 1) {
    const param = args[i];
    let paramValue = args[i + 1];

    if (param === '--duration' && paramValue) {
      duration = parseInt(paramValue, 10);
    }

    if (param === '--interval' && paramValue) {
      interval = parseInt(paramValue, 10);
    }

    if (param === '--length' && paramValue) {
      length = parseInt(paramValue, 10);
    }

    if (param === '--color' && paramValue) {
      let colorArg = paramValue;
      const escapeChar = '\x1b';
      const rgbMode = '[38;2';
      const endCommand = 'm';

      if (colorArg[0] === '#') {
        colorArg = colorArg.slice(1);
      }

      const redHex = colorArg.slice(0, 2);
      const redInt = parseInt(redHex, 16);

      const greenHex = colorArg.slice(2, 4);
      const greenInt = parseInt(greenHex, 16);

      const blueHex = colorArg.slice(4, 6);
      const blueInt = parseInt(blueHex, 16);

      color = `${escapeChar}${rgbMode};${redInt};${greenInt};${blueInt}${endCommand}`;

      // console.log(color);
    }
  }

  const totalSteps = duration / interval;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep += 1;

    const percentsFilledNum = Math.min(
      100,
      Math.floor((currentStep / totalSteps) * 100)
    );

    // console.log(percentsFilledNum);

    const filledLength = Math.floor((percentsFilledNum / 100) * length);
    const emptyLength = length - filledLength;

    const filled = Array(filledLength).fill('█').join('');
    const empty = Array(emptyLength).fill(' ').join('');

    let result;

    if (!!color) {
      result = `[${color}${filled}\x1b[0m${empty}] ${percentsFilledNum}%`;
    } else {
      result = `[${filled}${empty}] ${percentsFilledNum}%`;
    }

    process.stdout.write('\r' + result);

    if (currentStep >= totalSteps) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, interval);
};

progress();
