import { stdin, stdout, argv } from 'node:process'
import { Transform } from 'node:stream'

const filter = () => {
  const args = argv.slice(2)
  let word = ''
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--pattern') {
      word = args[i + 1] ?? ''
      break;
    }
  }

  let chunks = ''
  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      chunks += chunk.toString();
      const lines = chunks.split(/\r?\n/)
      chunks = lines.pop() ?? ''
      for(const line of lines) {
        if(line.includes(word)) {
          this.push(line + '\n')
        }
      }
      callback()
    },
    flush(callback) {
      if(chunks && chunks.includes(word)) {
        this.push(chunks + '\n')
      }
      callback()
    }
  })

  stdin.setEncoding('utf-8').pipe(transform).pipe(stdout)
};

filter();
