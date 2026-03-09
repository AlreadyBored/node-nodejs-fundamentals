import { spawn } from 'child_process';

const execCommand = () => {
  const arg = process.argv.slice(2);

  const cmdAndArgs = arg[0].split(" ");
  console.log(cmdAndArgs, 'sdsd')
  const [childCMD, ...childCMDComment] = cmdAndArgs;
  let cmd;

  console.log(childCMDComment);
  if (childCMDComment.length) {
    cmd = spawn(childCMD, [...childCMDComment], {
      stdio: 'inherit',
      env: process.env,
    });
  }

  cmd = spawn(childCMD);
  
  cmd.stdout.on('data', (data) => {
    process.stdout.write(`${data} from child`);
  });

  cmd.stderr.on('data', (data) => {
    console.log(data, 'p')
    process.stderr.write(`Error look: ${data}`);
  });

  cmd.on('exit', (code, signal) => {
    if (code !== null) {
      process.exit(code);
    } else {
      cmd.close('close', (code) => {
        process.exit(code);
      })
    }
  });
};

execCommand();
