import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const filter = () => {
  const args = process.argv.slice(2);
  const patternIdx = args.lastIndexOf("--pattern");
  const pattern =
    patternIdx !== -1 && args[patternIdx + 1] ? args[patternIdx + 1] : "";

  let leftover = "";

  const filterTransform = new Transform({
    transform(chunk, encoding, callback) {
      const text = leftover + chunk.toString();
      const lines = text.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }

      callback();
    },

    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + "\n");
      }
      callback();
    },
  });

  pipeline(process.stdin, filterTransform, process.stdout).catch((err) =>
    console.error(err),
  );
};

filter();
