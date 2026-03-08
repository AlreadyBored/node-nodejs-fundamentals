import { stdout, stderr, argv, env, exit } from "node:process";
import { spawn } from "node:child_process";

const execCommand = () => {
  const commandLine = argv.slice(2)[0];

  const spawnProcess = spawn(commandLine, {
    shell: true,
    env: {
      ...env,
      MY_ENV: "childEnv",
    },
  });

  spawnProcess.stdout.pipe(stdout);
  spawnProcess.stderr.pipe(stderr);

  spawnProcess.on("exit", (code) => {
    exit(code);
  });

  spawnProcess.on("error", (err) => {
    console.error(`stderr: ${err}`);
    exit(1);
  });
};

execCommand();
