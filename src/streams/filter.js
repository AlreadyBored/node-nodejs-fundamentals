import { Transform } from "stream";

const filter = () => {
  const patternIndex = process.argv.indexOf("--pattern");
  const pattern = patternIndex !== -1 ? process.argv[patternIndex + 1] : "";

  let leftover = "";

  const filterer = new Transform({
    transform(chunk, encoding, done) {
      const text = leftover + chunk.toString();
      const lines = text.split("\n");

      leftover = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(`${line}\n`);
        }
      }

      done();
    },

    flush(done) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover);
      }
      done();
    },
  });

  process.stdin.pipe(filterer).pipe(process.stdout);
};

filter();
