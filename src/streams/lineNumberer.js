import { pipeline, Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;

  const transform = new Transform({
    transform: (chunk, _, cb) => {
      const res = chunk.toString()
        .split("\n")
        .slice(0, -1)
        .map((value) => `${lineNumber++} | ${value}\n`)
        .join("");
        
      cb(null, res);
    },
  });

  pipeline(process.stdin, transform, process.stdout, () => {});
};

lineNumberer();

