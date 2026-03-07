import path from 'path'
import fs from 'fs/promises'

const restore = async () => {
  const snapshotPath = path.join(process.cwd(), 'snapshot.json')
  const restoredWorkspacePath = path.join(process.cwd(), 'workspace_restored')

  const recreateFileStructure = async () =>{
    const snapshotData = await fs.readFile(snapshotPath, 'utf8')
    const snapshotParsed = JSON.parse(snapshotData)

    await fs.mkdir(restoredWorkspacePath)

    for (let i of snapshotParsed.entries){
      const filePath = path.join(restoredWorkspacePath, i.path)
      const fileDirectory = path.dirname(filePath)
      
      await fs.mkdir(fileDirectory, { recursive: true })
      
      if (i.type === "file"){
        const decodedContent = Buffer.from(i.content, 'base64')
        
        await fs.writeFile(filePath, decodedContent)
      }
    }
  }

  try{
    await fs.access(snapshotPath)
    try{
      await fs.access(recreatedDirPath)
      throw 'This folder already exists'
    }
    catch (err){
      if (err.message === 'This folder already exists') throw err;
    }
    await recreateFileStructure()
  }
  catch{
    throw "FS operation failed"
  }
};

await restore();
