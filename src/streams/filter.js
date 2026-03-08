import { Transform } from 'node:stream';

const filter = () => {
  const { stdin, stdout, argv, exit } = process;

  const args = argv.slice(2);
  const patternArgIndex = args.indexOf('--pattern');

  if (patternArgIndex === -1 || (patternArgIndex + 1) >= args.length) {
    console.log('No pattern specified. Restart with pattern.');
    exit(1);
  }
  
  const filterStream = new Transform({
    transform(data, _, callback) {
      const lines = data.toString().split('\\n');

      this.push(lines.filter(line => line.includes(args[patternArgIndex + 1])).join('\n'));
      callback();
    }
  });

  stdin.pipe(filterStream).pipe(stdout);
};

filter();
