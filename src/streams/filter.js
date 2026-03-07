import { Transform } from "stream";

const filter = () => {
  const patternIndex = process.argv.indexOf("--pattern");
  const pattern =
    patternIndex !== -1 && process.argv[patternIndex + 1] !== undefined
      ? process.argv[patternIndex + 1]
      : null;
  let leftover = "";
  const transformStream = new Transform({
    transform(chunk, _encoding, callback) {
      const lines = (leftover + chunk.toString()).split(/\r?\n/);
      leftover = lines.pop() ?? "";

      for (const line of lines) {
        if (!pattern || line.includes(pattern)) {
          this.push(`${line}\n`);
        }
      }
      callback();
    },
    flush(callback) {
      if (leftover && (!pattern || leftover.includes(pattern))) {
        this.push(`${leftover}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformStream).pipe(process.stdout);
};

filter();
