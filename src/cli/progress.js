import { parseArgs } from 'node:util';
import { hexToAsnii, validateValueType } from '../utils/util.js';

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
    },
    strict: false,
    allowPositionals: true
  })
  if (values.color) {
    values.color = moderatedArgv[moderatedArgv.indexOf('--color') + 1];
  }

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
