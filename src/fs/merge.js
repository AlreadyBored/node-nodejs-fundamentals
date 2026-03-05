import path from 'path';
import fs from 'fs';

// need to redo

const merge = async () => {
  const dir = './src/cp';
  const argvs = process.argv.slice(2);
  let listFiles = [];

  try {
    if (argvs[0] === '--files' && argvs[1]) {
      listFiles = process.argv[1].split(',');

      for (const file of listFiles) {
        console.log(dir, file.name)
        fs.accessSync(path.join(dir, file.name));
      }
    } else {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      listFiles = files
        .filter((file) => {
          const fullPath = file.parentPath + '/' + file.name;
          const stat = fs.statSync(fullPath);
          console.log(fullPath)
          if (stat.isFile()
            && path.basename(fullPath).split('.')[path.basename(fullPath).split('.').length - 1] === 'js') {
              return file;
          }
        }).sort();

        if (listFiles.length === 0) {
          console.error('No text file found!');
        }
    }

    for (const file of listFiles) {
      const content = fs.readFileSync(path.join(dir, file.name), 'utf-8');
      process.stdout.write(content + '\n');

    }
  } catch (error) {
    console.error('Error:', error);
  }
};

await merge();

processFiles().catch(err => {
    console.error(err.message);
    process.exit(1);
});