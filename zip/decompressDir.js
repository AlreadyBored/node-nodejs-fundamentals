import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { PassThrough } from "stream";
import { pipeline } from "stream/promises";
import { createBrotliDecompress } from "zlib";

/**
 * Определяет путь к рабочей директории из аргументов командной строки
 * По умолчанию это текущая рабочая директория (process.cwd())
 * Игнорирует флаги (начинающиеся с --)
 */
const getWorkspacePath = () => {
  let workspacePath = process.cwd();
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (!arg.startsWith("--")) {
      workspacePath = arg.replace(/^"|"$/g, "");
      break;
    }
  }

  return workspacePath;
};

/**
 * Проверяет доступ к файлу по указанному пути
 * Логирует детали ошибки, но выбрасывает стандартное сообщение
 */
const checkAccess = async (path) => {
  try {
    await fs.access(path);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(`File or directory does not exist: ${path}`);
    } else if (error.code === "EACCES") {
      console.error(`No permission to access: ${path}`);
    } else {
      console.error(`Unexpected error accessing ${path}:`, error.message);
    }
    throw new Error("FS operation failed");
  }
};

/**
 * Читает заголовок из буфера
 */
function readHeader(buffer) {
  if (buffer.length < 4) return null;
  const pathLength = buffer.readUInt32LE(0);

  if (buffer.length < 4 + pathLength) return null;
  const relativePath = buffer.slice(4, 4 + pathLength).toString("utf8");

  if (buffer.length < 4 + pathLength + 8) return null;
  const fileSize = Number(buffer.readBigUInt64LE(4 + pathLength));

  const headerSize = 4 + pathLength + 8;
  const remainingBuffer = buffer.slice(headerSize);

  return {
    path: relativePath,
    size: fileSize,
    headerSize,
    remainingBuffer,
  };
}

/**
 * Функция распаковки архива, пока не работает
 *
 */
const decompressDir = async () => {
  const workspacePath = getWorkspacePath();
  const COMPRESSED_DIR = path.join(workspacePath, "compressed");
  const ARCHIVE_NAME = "archive.br";
  const DECOMPRESSED_DIR = path.join(workspacePath, "decompressed");
  const ARCHIVE_PATH = path.join(COMPRESSED_DIR, ARCHIVE_NAME);

  console.log(`\n📂 Проверка доступа...`);
  await checkAccess(COMPRESSED_DIR);
  await checkAccess(ARCHIVE_PATH);

  console.log(`📖 Чтение архива: ${ARCHIVE_PATH}`);

  // Сначала РАСПАКОВЫВАЕМ весь архив
  const readStream = createReadStream(ARCHIVE_PATH);
  const brotliDecompress = createBrotliDecompress();
  const passThrough = new PassThrough();

  // Собираем распакованные данные в буфер
  const chunks = [];
  passThrough.on("data", (chunk) => chunks.push(chunk));

  // Запускаем распаковку
  await pipeline(readStream, brotliDecompress, passThrough);

  // Объединяем все распакованные данные
  const decompressedBuffer = Buffer.concat(chunks);

  console.log(`📦 Распаковано ${decompressedBuffer.length} байт данных\n`);

  await fs.mkdir(DECOMPRESSED_DIR, { recursive: true });

  let buffer = decompressedBuffer;
  let fileCount = 0;

  console.log(`📦 Распаковка файлов из архива:\n`);

  while (buffer.length > 0) {
    const header = readHeader(buffer);

    if (!header) {
      console.log(
        `❌ Ошибка чтения заголовка на позиции ${decompressedBuffer.length - buffer.length}`,
      );
      break;
    }

    console.log(`  Найден файл: ${header.path}`);
    console.log(`    Размер данных: ${header.size} байт`);

    if (buffer.length < header.headerSize + header.size) {
      console.log(`    ❌ Недостаточно данных для файла`);
      break;
    }

    // Извлекаем данные файла
    const fileData = buffer.slice(
      header.headerSize,
      header.headerSize + header.size,
    );

    // Убираем обработанные данные из буфера
    buffer = buffer.slice(header.headerSize + header.size);

    fileCount++;
    const fullPath = path.join(DECOMPRESSED_DIR, header.path);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileData);
    console.log(`    ✅ Сохранен (${fileData.length} байт)\n`);
  }

  console.log(`\n✨ Готово! Распаковано файлов: ${fileCount}`);
};

await decompressDir();
