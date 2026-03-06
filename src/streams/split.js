import { parseArgs } from 'node:util';
import readline from 'readline';
import fs from 'node:fs';
const splitArgv = process.argv.slice(2);
const { values } = parseArgs({
  splitArgv,
  options: {
    lines: {
      type: 'string',
      default: '10',
    }
  }
});

const split = async () => {
  const dir = process.cwd() + '/source.txt';
  try {
    // Readable Stream, I didnot get that is it okay fs.createReadStream or I need to use from Web Stream
    const readableStream = fs.createReadStream(dir, { encoding: 'utf8' });
    
    const rl = readline.createInterface({
      input: readableStream,
      crlfDelay: Infinity
    });

    let fileCnt = 1;
    let lineCnt = 0;
    let writebleStream = null;

    for await (const line of rl) {
      if (lineCnt % parseInt(values.lines) === 0) {
        if (writebleStream) {
          writebleStream.end();
        }
        writebleStream = fs.createWriteStream(`chunk_${fileCnt++}.txt`);
      }

      writebleStream.write(`${line}\n`);
      lineCnt++;
    }

    if (writebleStream) writebleStream.end();
  } catch (error) {
    console.error(error);
  }
};

await split();
