import { Transform } from 'node:stream';

const lineNumberer = () => {
    let count = 1;
    let leftover = '';

    let transformStream = new Transform({
        transform(chunk, encoding, callback) {
            let text = leftover + chunk.toString();
            let lines = text.split('\n');
            leftover = lines.pop();

            for (let i = 0; i < lines.length; i++) {
                this.push(count + ' | ' + lines[i] + '\n');
                count = count + 1;
            }
            callback();
        },
        flush(callback) {
            if (leftover !== '') {
                this.push(count + ' | ' + leftover + '\n');
            }
            callback();
        }
    });

    process.stdin.pipe(transformStream).pipe(process.stdout);
};

lineNumberer();