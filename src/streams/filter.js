import { pipeline, Transform } from "stream";

const filter = () => {
  const patternIndex = process.argv.indexOf('--pattern');
  let filterWord = null;

  if (patternIndex !== -1) {
    filterWord = process.argv[patternIndex + 1];
  }

  const transfrom = new Transform({
    transform: (chunk, _, cb) => {
      const lines = chunk.toString().split('\n');

      let res;

      if (filterWord) {
        res = lines.filter((line) => line.includes(filterWord)).join('\n');
      } else {
        res = lines.join('\n');
      }

      cb(null, `${res}\n`);
    }
  })

  pipeline(
    process.stdin,
    transfrom,
    process.stdout,
    () => {}
  )
};

filter();
