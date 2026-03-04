import { parseArgs } from 'node:util';

const progress = () => {
  const moderatedArgv = process.argv.slice(2);
  const { values } = parseArgs({
    moderatedArgv,
    options: {
      duration: {
        type: 'string',
        default: '5000',
      },
      interval: {
        type: 'string',
        default: '100',
      },
      length: {
        type: 'string',
        default: '30',
      },
      color: {
        type: 'string',
        default: '#FFFFFF',
      }
    }
  })
  validateValueType(values);

  const fullWidth = parseInt(values.length);
  const interv = parseInt(values.interval);
  const steps = parseInt(values.duration) / parseInt(values.interval);
  let currentStep = 0;

  const progressFill = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;
    const percent = Math.round(progress * 100);
    const filledCnt = Math.round(fullWidth * progress);

    const asni = hexToAsnii(values.color);
    const filled = asni + '█'.repeat(filledCnt) + '\x1b[0m';
    const empty = " ".repeat(fullWidth - filledCnt);
    process.stdout.write(`\r[${filled}${empty}] ${percent}%`);

    if (currentStep >= steps) {
      clearInterval(progressFill);
      process.stdout.write('\nDone!\n');
    }
  }, interv);
};

progress();

function validateValueType(argsKeyValueForm) {
  
  if (isNaN(argsKeyValueForm.duration)) {
    throw new Error('No valid duration value!')
  }

  if (isNaN(argsKeyValueForm.interval)) {
    throw new Error('No valid interval value!')
  }

  if (isNaN(argsKeyValueForm.length)) {
    throw new Error('No valid length value!')
  }

  const regHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i

  if (!regHex.test(argsKeyValueForm.color)) {
    argsKeyValueForm.color = '#FFFFFF';
  }
}

function hexToAsnii(hexString) {
  const red = parseInt(hexString.slice(1, 3), 16);
  const green = parseInt(hexString.slice(3, 5), 16);
  const blue = parseInt(hexString.slice(5), 16);
  return `\x1b[38;2;${red};${green};${blue}m`;
}