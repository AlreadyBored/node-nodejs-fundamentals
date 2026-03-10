/**
 * Демо: как работает Transform стрим
 *
 * Схема:
 *
 *   [Файл] → Readable → Transform → Writable → [Файл]
 *
 *                       ┌─────────────────────────┐
 *                       │      TRANSFORM           │
 *   данные ────►        │ [writable буфер]         │
 *                       │        ↓                 │
 *                       │   _transform(chunk)      │  ← тут ты меняешь данные
 *                       │        ↓                 │
 *                       │ [readable буфер] ────────►  дальше
 *                       └─────────────────────────┘
 *
 *   У Transform ДВА буфера:
 *     1) Writable-сторона (вход) — принимает данные
 *     2) Readable-сторона (выход) — отдаёт изменённые данные
 */

import { Transform } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { writeFile, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, 'transform-input.txt');
const outputPath = join(__dirname, 'transform-output.txt');

// Создаём тестовый файл
await writeFile(inputPath, 'hello world\ngoodbye world\nnode streams');

console.log('=== ДЕМО: Transform стрим ===\n');

// --- Создаём свой Transform ---
const toUpperCase = new Transform({
  highWaterMark: 16,

  // Вот главный метод — вызывается для КАЖДОГО чанка
  transform(chunk, encoding, callback) {
    const input = chunk.toString();
    const output = input.toUpperCase();

    console.log(`  🔄 TRANSFORM получил:  "${input.trim()}"`);
    console.log(`     Writable-буфер (вход):  ${this.writableLength} байт`);

    // this.push() — кладёт результат в readable-буфер (выход)
    this.push(output);

    console.log(`     Readable-буфер (выход): ${this.readableLength} байт`);
    console.log(`     Отдал:                  "${output.trim()}"\n`);

    // callback() — "я закончил с этим чанком, давай следующий"
    callback();
  },
});

// --- Собираем цепочку ---

const readable = createReadStream(inputPath, {
  highWaterMark: 16,
  encoding: 'utf-8',
});

const writable = createWriteStream(outputPath, {
  highWaterMark: 16,
});

console.log('  Цепочка: Файл → Readable → Transform(toUpperCase) → Writable → Файл\n');
console.log('─'.repeat(60));

// pipe соединяет всё:
// readable.pipe(transform).pipe(writable)
//
// readable → [буфер] → transform.writable-вход → [буфер]
//                       _transform()
//                       transform.readable-выход → [буфер] → writable → [буфер] → диск

readable
  .pipe(toUpperCase)
  .pipe(writable);

writable.on('finish', async () => {
  console.log('─'.repeat(60));
  console.log('\n  ✅ Готово!\n');

  // Показываем результат
  const { readFile } = await import('node:fs/promises');
  const result = await readFile(outputPath, 'utf-8');
  console.log(`  Вход:  "hello world | goodbye world | node streams"`);
  console.log(`  Выход: "${result.replace(/\n/g, ' | ')}"\n`);

  // Уборка
  await unlink(inputPath);
  await unlink(outputPath);
});
