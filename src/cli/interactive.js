import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdoutdate
});

const commands = {
    uptime: () => process.stdout.write(`${process.uptime()}\n`),
    cwd: () => process.stdout.write(`${process.cwd()}\n`),
    date: () => process.stdout.write(`${new Date()}\n`),
    exit: () => {
        process.stdout.write('\nGoodbye!\n');
        rl.close();
        process.exit();
    },
};

const interactive = () => {
    rl.question('> ', (answer) => {
        if (commands[answer]) {
            commands[answer]();
        } else {
            process.stdout.write(`Unknown command\n`);
        }
        if (answer !== 'exit') {
            interactive();
        }
    });
};

rl.on('SIGINT', () => {
    process.stdout.write('\nGoodbye!\n');
    process.exit();
});

interactive();
