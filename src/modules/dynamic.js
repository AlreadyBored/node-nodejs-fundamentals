import { access } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { parseArgs } from "util";

const dynamic = async () => {
  const pluginArg = process.argv[2]
  
  try{
    const plugin = await import(`../modules/plugins/${pluginArg}.js`)
    console.log(plugin.run())
  }catch (err){
    console.error(err)
    process.exit(1)
  }

};

await dynamic();
