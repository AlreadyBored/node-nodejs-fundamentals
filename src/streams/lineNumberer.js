import { stdin, stdout } from 'node:process'
import { Transform } from 'node:stream'

const lineNumberer = () => {
  let chunks = ""
  let index = 1
  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      chunks += chunk.toString()
      const lines = chunks.split(/\r?\n/)
      chunks = lines.pop() ?? ''
      for(const line of lines) {
        this.push(`${index} | ${line}` + '\n')
        index += 1
      }
      callback()
    },
    flush(callback) {
      if(chunks)
        this.push(`${index} | ${chunks}` + '\n')
      callback()
    }
  })

  stdin.setEncoding('utf-8').pipe(transform).pipe(stdout)
};

lineNumberer();