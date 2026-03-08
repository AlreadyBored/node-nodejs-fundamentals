import { Transform } from 'node:stream';

const filter = () => {
    let args = process.argv;
    let pattern = '';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--pattern') {
            pattern = args[i + 1];
        }
    }

    let leftover = '';

    let transformStream = new Transform({
        transform(chunk, encoding, callback) {
            let text = leftover + chunk.toString();
            let lines = text.split('\n');
            leftover = lines.pop();

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(pattern)) {
                    this.push(lines[i] + '\n');
                }
            }
            callback();
        },
        flush(callback) {
            if (leftover !== '') {
                if (leftover.includes(pattern)) {
                    this.push(leftover + '\n');
                }
            }
            callback();
        }
    });

    process.stdin.pipe(transformStream).pipe(process.stdout);
};

filter();