import { Worker, } from "worker_threads";
import {spawn} from "child_process"

function setArrayInWorker() {
  const worker = new Worker(`
    const 
    `);
}

const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child
const command=process.argv[2];
  if (!command) {
    console.error("No command provided. Usage: node execCommand.js \"ls -la\"");
    process.exit(1);
  }
const child=spawn(command,{
  shell:true,
  env: process.env
})
child.stdout.pipe(process.stdout)
child.stdin.pipe(process.stdin)
child.on('close', (code)=>process.exit(code))

};

execCommand();
