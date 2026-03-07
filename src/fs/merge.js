import console from "console";
import fs from "fs/promises";
import { connect } from "http2";
import path from "path";

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  const workspace = path.join(process.cwd(), 'workspace')
  const partsPath = path.join(workspace, 'parts')
  
  var textFiles = []
  var merged = ""
  
  const putTxt = async dir => {
    for (let f of await fs.readdir(dir)){
      const filePath = path.join(dir, f)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()){
        await putTxt(filePath)
      }else if (path.extname(f) != ".txt"){ //there is a function that checks if every element pass the test 
        throw "FS operation failed"
      }else{
        const fileData = await fs.readFile(filePath, 'utf8')
        textFiles.push(fileData)
      }
    }
  }
  
  const mergeText = async () => {
    for (let i of textFiles){
      merged = merged.concat(i, "\n")  
    }
    await fs.writeFile(path.join(workspace, 'merged.txt'), merged)
  }

  await putTxt(partsPath);
  await mergeText();
};

await merge();
