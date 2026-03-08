import {
  Transform,
} from 'node:stream';

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout


  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      this.push(numerate(chunk.toString()));
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

function numerate(content) {
  const parts = content.split('\\n')
  let result = ''
  for (let i = 0; i < parts.length; i++) {
    result += `${i + 1} | ${parts[i]}`
    if (i != parts.length - 1) {
      result += '\n'
    }
  }
  return result
}

lineNumberer();
