import { Transform } from "stream";

/**
 * По заданию функция нумерует строки вводимые из коммандной строки
 * Добавила обработку чисел отдельно от основного задания,
 * Если ввести строку в которой есть \n, это воспримется как перенос строки
 */
const lineNumberer = () => {
  let lineNumber = 1;
  let buffer = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();

      const lines = buffer.replace(/\\n/g, "\n").split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        this.push(`${lineNumber++} | ${line}\n`);
      }

      callback();
    },

    flush(callback) {
      if (buffer) {
        const finalLine = buffer.replace(/\\n/g, "\n");
        this.push(`${lineNumber} | ${finalLine}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
