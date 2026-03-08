import { spawn } from 'node:child_process';
  const execCommand = () => {
      let commandString = process.argv[2];
  
      if (!commandString) {
          return;
      }
  
      let commandParts = commandString.split(' ');
      let mainCommand = commandParts[0];
      let commandArgs = commandParts.slice(1);
  
      let child = spawn(mainCommand, commandArgs, {
          env: process.env
      });
  
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
  
      child.on('exit', (code) => {
          let finalCode = code;
          if (finalCode === null) {
              finalCode = 0;
          }
          process.exit(finalCode);
      });
  };
  
  execCommand();
