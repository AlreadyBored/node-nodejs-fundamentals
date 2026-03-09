import fs from 'node:fs/promises';

const plugins = ['uppercase', 'reverse', 'repeat'];

const dynamic = async () => {
  const dir = process.cwd() + '/src/modules';
  const argv = process.argv.slice(2);
  if (!plugins.includes(argv[0])) {
    console.error('Plugin not found!');
    process.exit(1);
  }
  let module;
  let result;

  try {
    await fs.access(`${dir}/plugins`);
    const arrModulePromises = plugins.map(async (el) => {
      await fs.access(`${dir}/plugins/${el}.js`);
      return `./plugins/${el}.js`;
    });

    const arrModules = await Promise.all(arrModulePromises);
    
    for (const mod of arrModules) {
      if (mod === `./plugins/${argv[0]}.js`) {
        module = await import(mod);
        break;
      }
    }
    result = module.run();
  } catch (error) {
    if (error === 'ENOENT') {
      console.error(Error("FS operation failed"));
    } else if (error === 'EACCES') {
      console.error(Error("Access Denied!"));
    } else {
      console.error('Error: ', error)
    }
  } finally {
    process.stdout.write(result+'\n');
  }
};

await dynamic();
