import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const verify = async () => {
  const checksumsPath = path.join(process.cwd(), 'checksums.json');
  
  try {
    const contentJSON = (await fs.readFile(checksumsPath)).toString();
    const content = JSON.parse(contentJSON);
    const fileNames = Object.entries(content).map(([key]) => key);

    const fhs = await Promise.all(fileNames.map(async (name) => {
      const fh = await fs.open(path.join(process.cwd(), name));
      return { name, fh };
    }));

    fhs.forEach(({name, fh}) => {
      const stream = fh.createReadStream();
      const hash = crypto.createHash('sha256');

      stream.on('data', (chunk) => {
        hash.update(chunk);
      });

      stream.on('end', () => {
        const fileHash = hash.digest('hex');
        const status = content[name] === fileHash ? 'OK' : 'FAIL';
      
        console.log(`${name} — ${status}`);
        fh.close();
      })
    })
  } catch {
    throw new Error('FS operation failed')
  }
};

await verify();
