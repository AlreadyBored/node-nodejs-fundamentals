import { Transform } from "stream";

const lineNumberer = () => {
  let lineNum = 1;
  let leftover = "";

  const numberer = new Transform({
    transform(chunk, encoding, done) {
      const text = leftover + chunk.toString();
      const lines = text.split("\n");

      leftover = lines.pop();

      for (const line of lines) {
        this.push(`${lineNum} | ${line}\n`);
        lineNum++;
      }

      done();
    },

    flush(done) {
      if (leftover) {
        this.push(`${lineNum} | ${leftover}`);
      }
      done();
    },
  });

  process.stdin.pipe(numberer).pipe(process.stdout);
};

lineNumberer();
