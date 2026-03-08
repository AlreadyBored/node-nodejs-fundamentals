import fs from "fs/promises";
import path from "path";

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  // const workspace = path.join()
  const workspace = path.join(process.cwd(), 'workspace')
  const partsPath = path.join(workspace, 'parts')

  const txtCheck = async () => {
    const files = await fs.readdir(partsPath)
    try{
      if (!files.some(f => path.extname(f) === '.txt')){
        throw 'No .txt files'
      }
    }catch (err){
      if (err.message === 'No .txt files') throw "FS operation failed"
    }
  }

  txtCheck()

  var textContents = []
  var merged = ""
  
  const searchByFileName = async (names, dir) => {
    for (let n of names){
      const files = await fs.readdir(dir)
      if(!files.includes(n)){
        console.log( path.parse(n).name )
        throw "FS operation failed"
      }
      const filePath = path.join(dir, n)
      textContents.push(await fs.readFile(filePath, 'utf8'))
    }
  }

  const searchByExtension = async dir => {
    for (let f of await fs.readdir(dir)){
      const filePath = path.join(dir, f)
      const stats = await fs.stat(filePath)
      
      if (stats.isDirectory()){
        continue
      }

      if (path.extname(f) != ".txt"){
        throw "FS operation failed"
      }else{
        const fileData = await fs.readFile(filePath, 'utf8')
        textContents.push(fileData)
      }
    }
  }
  
  const mergeText = async () => {
    for (let i of textContents){
      merged = merged.concat(i, "\n")  
    }
    await fs.writeFile(path.join(workspace, 'merged.txt'), merged)
  }

  if (process.argv.length >= 4){
    if (process.argv.includes('--files') && process.argv.indexOf('--files') < process.argv.length-1){
      const fileNames = process.argv.filter(a => process.argv.indexOf(a) > process.argv.indexOf('--files'))
      await searchByFileName(fileNames, partsPath);
    }
  }else{
    await searchByExtension(partsPath);
  }

  await mergeText();
};

await merge();
