const printBar = (percent) => {
    const total = 20;
    const filled = Math.floor(total * percent / 100);
    const empty = total - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent}%`);
};

const progress = () => {
    let percent = 0;
    let fiveSecondsLimitThreshold = 2;
    const interval = setInterval(() => {
        printBar(percent);
        percent += fiveSecondsLimitThreshold;
        if (percent > 100) {
            clearInterval(interval);
            process.stdout.write('\n');
        }
    }, 100);
};

progress();
