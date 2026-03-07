import fs from "fs"
import path from "path"


const snapshot = async () => {
  let entries=[]
const rootPath=process.cwd();

  function readDirectory(pathDirectory){
    const files=fs.readdirSync(pathDirectory);
    for(let file of files){
      const fullPath=path.join(pathDirectory, file);
      const stat=fs.statSync(fullPath);
      if(stat.isFile()){
        const content=fs.readFileSync(fullPath,{encoding:"base64"});
         entries.push({
        path:path.relative(rootPath, fullPath),
        type:'file',
        size:stat.size,
        content
      })
      }else{
         entries.push({
        path:path.relative(rootPath, fullPath),
        type:"directory"})
        readDirectory(fullPath);
      }
    }
  }
  readDirectory(rootPath)
  const data={
    rootPath,
    entries
  }
  fs.writeFileSync("./src/fs/snapshot.json",JSON.stringify(data, "",2))
};

await snapshot();
