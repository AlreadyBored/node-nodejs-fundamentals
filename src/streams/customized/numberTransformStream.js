import { Transform } from 'node:stream';

export class StartLineWithNumberTranform extends Transform {
    constructor(options) {
        super(options);
        this.lineNumber = 1;
        this.lineBuffer = '';
    }

    _transform(chunk, encoding, callback) {
        this.lineBuffer += chunk.toString();
        const lines = this.lineBuffer.split('\n');

        this.lineBuffer = lines.pop();

        for (const line of lines) {
            this.push(`${this.lineNumber} | ${line}\n`);
            this.lineNumber++;
        }

        callback();
    }

    _flush(callback) {
        if (this.lineBuffer.length > 0) {
            this.push(`${this.lineNumber++} | ${this.lineBuffer}\n`);
        }

        callback();
    }
}