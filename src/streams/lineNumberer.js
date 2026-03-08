import { Transform } from 'node:stream';

const lineNumberer = () => {
  const { stdin, stdout } = process;
  
  let lineNumber = 1;
  
  const lineNumberStream = new Transform({
    transform(data, _, callback) {
      const lines = data.toString().split('\\n');

      this.push(lines.map(line => `${lineNumber++} | ${line}`).join('\n'));
      callback();
    }
  });

  stdin.pipe(lineNumberStream).pipe(stdout);
};

lineNumberer();
