import { Transform } from 'node:stream';
import { argv } from 'node:process';

const parsePattern = () => {
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pattern' && args[i + 1]) {
      return args[i + 1];
    }
  }
  console.error('Usage: --pattern <string>');
  process.exit(1);
};

class LineFilter extends Transform {
  constructor(pattern) {
    super({ encoding: 'utf8' });
    this.pattern = pattern;
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.includes(this.pattern)) {
        this.push(line + '\n');
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.buffer.includes(this.pattern)) {
      this.push(this.buffer + '\n');
    }
    callback();
  }
}

const pattern = parsePattern();
process.stdin.pipe(new LineFilter(pattern)).pipe(process.stdout);
