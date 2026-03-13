/**
 * Та же задача, но БЕЗ Transform — вся логика в _write()
 *
 * Сравни с split-to-files.js где используется Transform (lineSplitter).
 * Тут всё в одном месте — и разбиение на строки, и ротация файлов.
 *
 * ⚠️ Работает, но _write() делает ДВЕ работы одновременно:
 *    1) Склеивает огрызки строк (потому что чанк режет по байтам)
 *    2) Считает строки и ротирует файлы
 */

import { Writable } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { writeFile, unlink, mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = join(__dirname, '_split-demo-v2');
const INPUT_PATH = join(WORK_DIR, 'input.txt');

const TOTAL_LINES = 35;
const LINES_PER_FILE = 10;

await mkdir(WORK_DIR, { recursive: true });

const lines = Array.from({ length: TOTAL_LINES }, (_, i) =>
  `Сегмент #${String(i + 1).padStart(2, '0')}: данные-${Math.random().toString(36).slice(2, 8)}`
);
await writeFile(INPUT_PATH, lines.join('\n'));

console.log('=== БЕЗ Transform — всё в _write() ===\n');

// ─── Всё в одном Writable ──────────────────────────────────────────

let remainder = '';        // огрызок строки с прошлого чанка
let lineCount = 0;
let fileIndex = 0;
let currentStream = null;
const createdFiles = [];

function openNewFile() {
  return new Promise((resolve, reject) => {
    fileIndex++;
    const fileName = `chunk_${String(fileIndex).padStart(3, '0')}.txt`;
    const filePath = join(WORK_DIR, fileName);
    createdFiles.push(filePath);
    currentStream = createWriteStream(filePath, { encoding: 'utf-8' });
    console.log(`\n  📁 Создан: ${fileName}`);
    currentStream.on('open', resolve);
    currentStream.on('error', reject);
  });
}

function closeCurrentFile() {
  return new Promise((resolve) => {
    if (!currentStream) return resolve();
    currentStream.end(() => {
      console.log(`  📦 Закрыт (${lineCount} строк)`);
      lineCount = 0;
      resolve();
    });
  });
}

const splitter = new Writable({
  // НЕ objectMode! Мы получаем сырые Buffer/string чанки от Readable
  decodeStrings: false,

  async write(chunk, encoding, callback) {
    try {
      // ─── Работа 1: собираем строки из огрызков ───
      // (это то, что делал Transform в прошлой версии)
      remainder += chunk.toString();
      const parts = remainder.split('\n');
      remainder = parts.pop(); // последний — неполная строка, сохраняем

      // ─── Работа 2: пишем строки, ротируем файлы ───
      // (это то, что делал Writable в прошлой версии)
      for (const line of parts) {
        if (line.length === 0) continue;

        if (!currentStream || lineCount >= LINES_PER_FILE) {
          await closeCurrentFile();
          await openNewFile();
        }

        lineCount++;
        currentStream.write(line + '\n');
        console.log(`    ✏️  ${lineCount}/${LINES_PER_FILE} → "${line.slice(0, 40)}..."`);
      }

      callback();
    } catch (err) {
      callback(err);
    }
  },
});

// Обработка остатка и последнего файла
splitter._final = async function (callback) {
  try {
    // Остаток (последняя строка без \n)
    if (remainder.length > 0) {
      if (!currentStream || lineCount >= LINES_PER_FILE) {
        await closeCurrentFile();
        await openNewFile();
      }
      lineCount++;
      currentStream.write(remainder + '\n');
      console.log(`    ✏️  ${lineCount}/${LINES_PER_FILE} → "${remainder.slice(0, 40)}..."`);
    }
    await closeCurrentFile();
    callback();
  } catch (err) {
    callback(err);
  }
};

// ─── Цепочка: ВСЕГО 2 звена ────────────────────────────────────────

const readable = createReadStream(INPUT_PATH, {
  highWaterMark: 64,
  encoding: 'utf-8',
});

readable.pipe(splitter);   // ← без Transform! Напрямую.

splitter.on('finish', async () => {
  console.log('\n' + '─'.repeat(60));
  console.log('\n  ✅ Результат:\n');

  for (const filePath of createdFiles) {
    const content = await readFile(filePath, 'utf-8');
    const lc = content.trim().split('\n').length;
    const fn = filePath.split('/').pop();
    console.log(`  📄 ${fn} (${lc} строк)`);
  }

  // Уборка
  for (const f of createdFiles) await unlink(f);
  await unlink(INPUT_PATH);
  const { rmdir } = await import('node:fs/promises');
  await rmdir(WORK_DIR);
  console.log('\n  🧹 Удалено\n');
});
