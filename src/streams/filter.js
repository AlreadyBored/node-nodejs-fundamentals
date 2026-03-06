import { Transform } from "stream";

const filter = () => {
  const args = process.argv;
  const patternIndex = args.indexOf("--pattern");

  const pattern =
    patternIndex !== -1 && args[patternIndex + 1] ? args[patternIndex + 1] : "";

  let leftover = "";

  const transformer = new Transform({
    transform(chunk, _encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      const filtered = lines
        .filter((line) => line.includes(pattern))
        .join("\n");

      if (filtered) {
        this.push(filtered + "\n");
      }

      callback();
    },

    flush(callback) {
      if (leftover.includes(pattern)) {
        this.push(leftover + "\n");
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();
