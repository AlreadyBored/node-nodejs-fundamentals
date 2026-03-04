import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

for (const f of ['file1.txt', 'file2.txt']) {
  const buf = readFileSync(join(__dirname, f));
  const hash = createHash('sha256').update(buf).digest('hex');
  console.log(`${f}: ${hash}`);
}
