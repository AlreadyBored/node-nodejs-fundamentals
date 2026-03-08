# 📔 Node.js Study Notes - Fundamentals (2026 Edition)

## 🏗️ 1. Foundations (Path & Process)

* **`process.cwd()`**: Returns the "Current Working Directory". It's the robot saying: "I am standing exactly here".
* **`process.argv`**: The array that stores everything you type in the terminal after the command.
* **`path.resolve`**: Convert relative routes into absolute routes.
* **`path.join`**: Avoid errors by joining parts of routes in a secure way (handles `/` vs `\`).
* **`path.relative`**: Cleans the route and gives only the path relative to another (e.g., from workspace to file).
* **`path.extname`**: Returns the file extension (e.g., `.txt`).
* **`path.dirname`**: Returns the name of the parent directory. Useful to know where a file is sitting.

---

## 📂 2. File System (fs/promises)

* **`fs/promises`**: Using the asynchronous version of the FS module so we can use `await`.
* **`readdir`**: Lists everything inside a folder.
* **`stat`**: Checks metadata (if it's a file, directory, and its size).
* **`readFile` / `writeFile`**: Basic commands to read content and create/overwrite files.
* **`mkdir`**: Creates a new directory. Used with `{ recursive: true }` to create nested folders (a/b/c) all at once.
* **`Buffer`**: A way to handle raw binary data. We used `Buffer.from(content, "base64")` to turn encoded text back into real files.
* **`.toString("base64")`**: Converts file content into a base64 string for easy storage in JSON.

---

## ⌨️ 3. CLI & Terminal UI

* **`readline`**: A module used to read input from the terminal line by line. It’s the "listening ear" of the app.
* **`process.uptime()`**: Returns how many seconds the Node process has been running.
* **`.toISOString()`**: Returns a string in standard ISO format (YYYY-MM-DDTHH:mm:ss.sssZ).
* **`\r` (Carriage Return)**: Moves the cursor back to the start of the line without jumping to the next one. Essential for "in-place" updates like progress bars.
* **ANSI Escape Codes**: Special sequences (like `\x1b[38;2;...`) used to color and format terminal text.
* **Hex to RGB**: Converting `#RRGGBB` into three numbers (Red, Green, Blue) so the terminal can apply colors.

---

## 🧩 4. Dynamic Modules

* **`import()`**: A function-like expression that allows you to load a module asynchronously on the fly.
* **`pathToFileURL`**: Converts a system path into a URL (`file:///...`), necessary for dynamic imports on modern Node.js versions.

---

## 🛡️ 5. Hashing & Security

* **`createHash('sha256')`**: Creates a unique "digital fingerprint" (64 characters). If one bit changes, the hash changes completely.
* **`createReadStream`**: Opens a "river" of data. Instead of drinking the whole thing at once (avoiding memory crashes), we process it by "trickles" (chunks).
* **`pipeline`**: The "glue." It connects streams safely and handles errors automatically. It's the modern way to pipe data.

---

## 🌊 6. Streams & Transformations

* **Transform Stream**: A duplex stream that modifies or transforms the data as it passes through (e.g., adding line numbers or filtering).
* **`process.stdin` / `process.stdout`**: The standard input (keyboard) and output (screen) streams of the process.
* **`chunk`**: A small piece of data (usually a Buffer) being processed in the stream pipeline.
* **Backpressure**: A situation where data is produced faster than it can be consumed; Streams handle this automatically to save memory.

---

## 🤐 7. Compression (Zlib & Brotli)

* **`zlib`**: The built-in module for compression and decompression.
* **Brotli (`.br`)**: A modern, high-efficiency compression algorithm from Google, superior to Gzip for text assets.
* **`createBrotliCompress` / `createBrotliDecompress`**: Transform streams used to shrink or restore data.

---

## 🧵 8. Worker Threads (Parallelism)

* **Main Thread**: The primary execution path. It handles the event loop and delegates heavy CPU tasks.
* **Worker Thread**: An independent thread that runs alongside the main thread.
* **`parentPort`**: The communication channel (walkie-talkie) between the worker and the main thread.
* **Divide and Conquer**: Splitting a large problem into smaller chunks to be solved in parallel by multiple workers.

---

## 👶 9. Child Processes

* **`spawn`**: Launches a new process (like `ls`, `date`, or any terminal command).
* **`stdio: inherit / pipe`**: Connecting the child's input/output channels to the parent process.
* **Exit Code**: A number returned by the process when it finishes. `0` means success; anything else indicates an error.