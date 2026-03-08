import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';
import { Readable } from 'stream';

const compress = async () => {
}

await compress();
