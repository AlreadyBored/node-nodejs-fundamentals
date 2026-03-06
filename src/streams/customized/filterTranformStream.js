import { Transform } from 'node:stream';
import { parseArgs } from 'node:util';
const patternArgv = process.argv.slice(2);
const { values } = parseArgs({
  patternArgv,
  options: {
    pattern: {
      type: 'string'
    }
  }
});

export class FilterByArgumentTranform extends Transform {
    constructor(options) {
        super(options);
        this.buffer = '';
    }

    _transform(chunk, encoding, callback) {
        this.buffer += chunk;
        const lines = this.buffer.split('\n');

        this.buffer = lines.pop();

        for (const line of lines) {
            if (line.includes(values.pattern)) {
                this.push(`${line}\n`);
            }
        }

        callback();
    }

    _flush(callback) {
        if (this.buffer.length > 0 && this.buffer.includes(values.pattern)) {
            this.push(`${this.buffer}\n`);
        }
        
        callback();
    }
}