import {
  Transform,
} from 'node:stream';


const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout


  const patternIdx = process.argv.indexOf("--pattern")
  if (patternIdx == -1 || patternIdx == process.argv.length - 1) {
    console.log('Pattern parameter should be passed in')
    process.exit(1)
  }

  const strLiteral = getLiteral(process.argv[patternIdx+1]);
  console.log(strLiteral)

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const str = chunk.toString()
      if (strLiteral.test(str)) {
        this.push(str);
      }
      callback();
    },
  });
  process.stdin.pipe(transformer).pipe(process.stdout);
};

function getLiteral(patternStr) {
  // 1. Extract pattern (between slashes) and flags (after last slash)
  const match = patternStr.match(/^\/(.*)\/([a-z]*)$/);
  let strLiteral
  if (match) {
    const pattern = match[1];
    const flags = match[2];

    // 2. Create the RegExp object
    strLiteral = new RegExp(pattern, flags);
  } else {
    strLiteral = new RegExp(patternStr);
  }
  return strLiteral
}

filter();
