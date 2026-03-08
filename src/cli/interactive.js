import * as readline from 'node:readline';
const interactive = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    rl.prompt();

    rl.on('line', (line) => {
        let cmd = line.trim();

        if (cmd === 'uptime') {
            console.log('Uptime: ' + process.uptime() + 's');
        } else if (cmd === 'cwd') {
            console.log(process.cwd());
        } else if (cmd === 'date') {
            let d = new Date();
            console.log(d.toISOString());
        } else if (cmd === 'exit') {
            console.log('Goodbye!');
            rl.close();
        } else {
            console.log('Unknown command');
        }

        if (cmd !== 'exit') {
            rl.prompt();
        }
    });

    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });
};

interactive();