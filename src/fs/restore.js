import fs from "fs/promises"
import path from "path";

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  const root=process.cwd()
  const rootPath=path.join(root, 'restore');

try{
   const data= await fs.readFile('./src/fs/snapshot.json');
 const files=JSON.parse(data).entries;
 await fs.mkdir(rootPath, {recursive:true})

 for(const file of files){
    if(file.type==='directory'){
      await fs.mkdir(path.join(rootPath, file.path), )
    } 
 }


 for(const file of files){
    if(file.type==='file'){
      await fs.writeFile(path.join(rootPath, file.path), file.content)
    } 
 }
}
catch(e){
  console.error("Error\n",e.message,'\n')
}

};

await restore();
