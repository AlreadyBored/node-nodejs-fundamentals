const args = process.argv.slice(2);

const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : undefined;
};

const duration = parseInt(getArg('duration') ?? '5000');
const interval = parseInt(getArg('interval') ?? '100');
const length = parseInt(getArg('length') ?? '30');

const printBar = (percent) => {
    const filled = Math.floor(length * percent / 100);
    const empty = length - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent}%`);
};

const progress = () => {
    const steps = Math.floor(duration / interval);
    const stepPercent = 100 / steps;
    let elapsed = 0;

    const intervalId = setInterval(() => {
        elapsed++;
        const percent = Math.min(Math.round(elapsed * stepPercent), 100);
        printBar(percent);
        if (percent >= 100) {
            clearInterval(intervalId);
            process.stdout.write('\nDone!\n');
        }
    }, 100);
};

progress();
