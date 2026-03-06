import { createReadStream, createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { createBrotliCompress } from "zlib";

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
 * Рекурсивно собирает все файлы из директории и её подпапок
 * Функция работает во всех версиях Node.js начиная с 10.10.0
 * В отличие от встроенного recursive: true, который появился только в Node.js 18+
 */
const getAllFiles = async (dir, baseDir = dir, fileList = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await getAllFiles(fullPath, baseDir, fileList);
    } else {
      const relativePath = path.relative(baseDir, fullPath);

      const stats = await fs.stat(fullPath);

      fileList.push({
        fullPath,
        relativePath,
        name: entry.name,
        size: stats.size,
      });
    }
  }

  return fileList;
};

/**
 * Функция для записи информации о файле в архив
 */
async function writeFileHeaderToArchive(archiveStream, relativePath, fileSize) {
  return new Promise((resolve, reject) => {
    const pathBuffer = Buffer.from(relativePath, "utf8");
    const pathLengthBuffer = Buffer.alloc(4);
    pathLengthBuffer.writeUInt32LE(pathBuffer.length);

    const sizeBuffer = Buffer.alloc(8);
    sizeBuffer.writeBigUInt64LE(BigInt(fileSize));

    archiveStream.write(pathLengthBuffer, (err) => {
      if (err) return reject(err);
      archiveStream.write(pathBuffer, (err) => {
        if (err) return reject(err);
        archiveStream.write(sizeBuffer, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  });
}

/**
 * Функция для архивации файлов из папки toCompress из указанной директории
 * Если директория не указана скприт будет автоматически искать ее в текущей рабочей директории
 * Есть проблема утечки памяти которую я не решила, увеличивать количество потоков в ручную не захотелось
 */
const compressDir = async () => {
  const workspacePath = getWorkspacePath();
  const SOURCE_DIR = path.join(workspacePath, "toCompress");
  const TARGET_DIR = path.join(workspacePath, "compressed");
  const ARCHIVE_NAME = "archive.br";
  const ARCHIVE_PATH = path.join(TARGET_DIR, ARCHIVE_NAME);

  //не понятно что там со статусом fs.exists так что будет такая проверка
  try {
    await checkAccess(SOURCE_DIR);
    console.log(`Source directory exists: ${SOURCE_DIR}`);
  } catch (error) {
    return;
  }

  try {
    await fs.mkdir(TARGET_DIR, { recursive: true });

    const archiveStream = createWriteStream(ARCHIVE_PATH);

    const filesInfo = await getAllFiles(SOURCE_DIR);
    for (const fileInfo of filesInfo) {
      await writeFileHeaderToArchive(
        archiveStream,
        fileInfo.relativePath,
        fileInfo.size,
      );
      const brotli = createBrotliCompress();
      const readStream = createReadStream(fileInfo.fullPath);
      try {
        await pipeline(readStream, brotli, archiveStream, { end: false });
        console.log(`✅ ${fileInfo.name}`);
      } finally {
        readStream.destroy();
        brotli.destroy();
      }
    }

    console.log(`🎉 Все файлы обработаны!`);
    archiveStream.end();
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await compressDir();
