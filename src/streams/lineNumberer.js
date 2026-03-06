import { StartLineWithNumberTranform } from './customized/transformStream.js';

const lineNumberer = () => {
  const customLine = new StartLineWithNumberTranform();

  process.stdin
    .pipe(customLine)
    .pipe(process.stdout);
};

lineNumberer();
