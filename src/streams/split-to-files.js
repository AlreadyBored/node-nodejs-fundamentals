/**
 * Демо: Разбиение стрима на несколько файлов
 *
 * Задача:
 *   Читаем файл с N строками (сегментами).
 *   Каждые LINES_PER_FILE строк — создаём НОВЫЙ файл и пишем туда.
 *
 * Схема:
 *
 *   [Большой файл]
 *        │
 *        ▼
 *    Readable (.pipe)
 *        │
 *        ▼
 *    Split (разбивает по \n)
 *        │
 *        ▼
 *    FileSplitter (кастомный Writable)
 *        │
 *        ├──► chunk_001.txt  (строки 1–10)
 *        ├──► chunk_002.txt  (строки 11–20)
 *        ├──► chunk_003.txt  (строки 21–30)
 *        └──► ...
 *
 * Ключевая идея:
 *   Внутри _write() ты сам решаешь КУДА писать.
 *   Считаешь строки → когда порог достигнут →
 *     1) закрываешь текущий WriteStream (.end())
 *     2) создаёшь новый createWriteStream()
 *     3) пишешь в него
 *
 *   ⚠️ Важно: .write() у WriteStream может вернуть false (буфер полон).
 *      Тогда нужно подождать событие 'drain', прежде чем продолжать.
 *      Именно для этого callback в _write() вызывается после drain.
 */

import { Writable, Transform } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { writeFile, unlink, mkdir, readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = join(__dirname, '_split-demo');
const INPUT_PATH = join(WORK_DIR, 'input.txt');

const TOTAL_LINES = 35;      // сколько строк сгенерируем
const LINES_PER_FILE = 10;   // каждые 10 строк → новый файл

// ─── 1. Подготовка: создаём папку и входной файл ─────────────────────

await mkdir(WORK_DIR, { recursive: true });

// Генерируем файл с 35 строками
const lines = Array.from({ length: TOTAL_LINES }, (_, i) =>
  `Сегмент #${String(i + 1).padStart(2, '0')}: данные-${Math.random().toString(36).slice(2, 8)}`
);
await writeFile(INPUT_PATH, lines.join('\n'));

console.log('=== ДЕМО: Разбиение стрима на несколько файлов ===\n');
console.log(`  Входной файл: ${TOTAL_LINES} строк`);
console.log(`  Порог: каждые ${LINES_PER_FILE} строк → новый файл\n`);
console.log('─'.repeat(60));

// ─── 2. Transform: разбиваем поток байтов на строки ──────────────────
//
// Проблема: Readable отдаёт чанки по байтам (highWaterMark),
// а не по строкам. Чанк может оборваться посреди строки!
//
// Решение: Transform-стрим, который буферизует остаток
// и отдаёт только целые строки.

const lineSplitter = new Transform({
  readableObjectMode: true,   // на выходе — объекты (строки), а не Buffer
  encoding: 'utf-8',

  transform(chunk, encoding, callback) {
    // _остаток хранит «хвост» предыдущего чанка
    this._remainder = (this._remainder || '') + chunk.toString();
 
    const parts = this._remainder.split('\n');

    // Последний элемент — неполная строка (или ''), сохраняем
    this._remainder = parts.pop();

    // Все остальные — целые строки, отправляем дальше
    for (const line of parts) {
      if (line.length > 0) {
        this.push(line);
      }
    }
    callback();
  },

  // Когда входной поток закончился — отдаём остаток
  flush(callback) {
    if (this._remainder && this._remainder.length > 0) {
      this.push(this._remainder);
    }
    callback();
  },
});

// ─── 3. Кастомный Writable: ротация файлов ──────────────────────────
//
// ЭТО ГЛАВНАЯ ЧАСТЬ.
//
// Внутри _write() мы:
//   - считаем строки
//   - когда счётчик достиг порога → закрываем старый файл, открываем новый
//   - пишем строку в текущий файл
//
// Событие 'drain' — вот то самое событие, о котором ты спрашивал!
// Когда writable.write() возвращает false, буфер переполнен.
// Нужно ждать 'drain', чтобы продолжить запись.

class FileSplitter extends Writable {
  constructor(outputDir, linesPerFile) {
    super({ objectMode: true }); // принимаем объекты (строки от lineSplitter)

    this.outputDir = outputDir;
    this.linesPerFile = linesPerFile;
    this.lineCount = 0;        // счётчик строк в текущем файле
    this.fileIndex = 0;        // номер текущего файла
    this.currentStream = null; // текущий WriteStream
    this.createdFiles = [];    // список созданных файлов (для уборки)
  }

  /**
   * Создаёт новый выходной файл и WriteStream для него.
   * Возвращает Promise, который резолвится когда файл готов к записи.
   */
  _openNewFile() {
    return new Promise((resolve, reject) => {
      this.fileIndex++;
      const fileName = `chunk_${String(this.fileIndex).padStart(3, '0')}.txt`;
      const filePath = join(this.outputDir, fileName);
      this.createdFiles.push(filePath);

      // Создаём новый WriteStream
      this.currentStream = createWriteStream(filePath, { encoding: 'utf-8' });

      console.log(`\n  📁 Создан файл: ${fileName}`);

      // Ждём 'open' — файл реально открыт и готов
      this.currentStream.on('open', () => resolve());
      this.currentStream.on('error', (err) => reject(err));
    });
  }

  /**
   * Закрывает текущий WriteStream.
   * .end() — "больше писать не буду", стрим допишет буфер и закроется.
   * Ждём 'finish' — всё реально записано на диск.
   */
  _closeCurrentFile() {
    return new Promise((resolve) => {
      if (!this.currentStream) return resolve();

      this.currentStream.end(() => {
        console.log(`  📦 Файл закрыт (записано ${this.lineCount} строк)`);
        this.lineCount = 0;
        resolve();
      });
    });
  }

  /**
   * _write() — вызывается для КАЖДОГО чанка (у нас — каждой строки).
   *
   * ⚠️ callback нужно вызвать ТОЛЬКО когда запись реально завершена.
   *    Если вызвать раньше — стрим пришлёт следующий чанк,
   *    а мы ещё не закончили с текущим → потеря данных или гонка.
   */
  async _write(line, encoding, callback) {
    try {
      // Первый чанк или порог достигнут → ротация файла
      if (!this.currentStream || this.lineCount >= this.linesPerFile) {
        await this._closeCurrentFile();
        await this._openNewFile();
      }

      this.lineCount++;
      const data = line + '\n';

      // .write() возвращает boolean:
      //   true  → буфер НЕ полон, можно писать ещё
      //   false → буфер полон, НУЖНО ЖДАТЬ 'drain'!
      const canContinue = this.currentStream.write(data);

      console.log(`    ✏️  Строка ${this.lineCount}/${this.linesPerFile} → "${line.slice(0, 40)}..."`);

      if (!canContinue) {
        // Буфер WriteStream переполнен!
        // Ждём событие 'drain' — "буфер освободился, можно писать"
        console.log(`    ⏳ Буфер полон! Ждём 'drain'...`);
        await new Promise((resolve) => this.currentStream.once('drain', resolve));
        console.log(`    ✅ 'drain' получен, продолжаем`);
      }

      callback(); // "я закончил с этим чанком, давай следующий"
    } catch (err) {
      callback(err);
    }
  }

  /**
   * _final() — вызывается когда ВСЕ чанки обработаны.
   * Тут закрываем последний файл.
   */
  async _final(callback) {
    try {
      await this._closeCurrentFile();
      callback();
    } catch (err) {
      callback(err);
    }
  }
}

// ─── 4. Собираем цепочку и запускаем ────────────────────────────────

const readable = createReadStream(INPUT_PATH, {
  highWaterMark: 64,  // специально маленький, чтобы было несколько чанков
  encoding: 'utf-8',
});

const splitter = new FileSplitter(WORK_DIR, LINES_PER_FILE);

// readable → lineSplitter → fileSplitter
readable
  .pipe(lineSplitter)
  .pipe(splitter);

splitter.on('finish', async () => {
  console.log('\n' + '─'.repeat(60));
  console.log('\n  ✅ Готово! Результат:\n');

  // Показываем содержимое каждого созданного файла
  for (const filePath of splitter.createdFiles) {
    const content = await readFile(filePath, 'utf-8');
    const lineCount = content.trim().split('\n').length;
    const fileName = filePath.split('/').pop();
    console.log(`  📄 ${fileName} (${lineCount} строк):`);
    console.log(`     Первая: "${content.split('\n')[0]}"`);
    console.log(`     Последняя: "${content.trim().split('\n').pop()}"\n`);
  }

  // Уборка
  for (const f of splitter.createdFiles) await unlink(f);
  await unlink(INPUT_PATH);
  const { rmdir } = await import('node:fs/promises');
  await rmdir(WORK_DIR);
  console.log('  🧹 Временные файлы удалены\n');
});
