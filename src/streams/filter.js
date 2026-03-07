import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const filter = () => {
  const args = process.argv.slice(2);
  const patternIndex = args.indexOf("--pattern");
  const pattern =
    patternIndex !== -1 && args[patternIndex + 1] ? args[patternIndex + 1] : "";

  let remainder = "";

  const filterTransform = new Transform({
    transform(chunk, encoding, callback) {
      const text = remainder + chunk.toString();
      const lines = text.split("\n");
      remainder = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }

      callback();
    },

    flush(callback) {
      if (remainder.length > 0 && remainder.includes(pattern)) {
        this.push(remainder);
      }
      callback();
    },
  });

  pipeline(process.stdin, filterTransform, process.stdout).catch(() => {});
};

filter();
