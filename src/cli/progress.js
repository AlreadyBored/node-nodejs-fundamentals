const progress = () => {
    const { stdout, argv } = process;

    let duration = 5000;
    let interval = 100;
    let length = 30;
    let color = null;

    for (let i = 2; i < argv.length; i++) {
        switch (argv[i]) {
            case '--duration':
                duration = parseInt(argv[++i], 10) || duration;
                break;
            case '--interval':
                interval = parseInt(argv[++i], 10) || interval;
                break;
            case '--length':
                length = parseInt(argv[++i], 10) || length;
                break;
            case '--color':
                const c = argv[++i];
                if (/^#([0-9A-Fa-f]{6})$/.test(c)) color = c;
                break;
            default:
                console.warn(`Unknown param: ${argv[i]}`);
        }
    }

    const hexToAnsi = hex => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `\x1b[38;2;${r};${g};${b}m`;
    };

    const drawProgress = percent => {
        const filledLength = Math.round((percent / 100) * length);
        const emptyLength = length - filledLength;
        const filled = '█'.repeat(filledLength);
        const empty = ' '.repeat(emptyLength);
        const coloredFilled = color ? `${hexToAnsi(color)}${filled}\x1b[0m` : filled;
        stdout.write(`\r[${coloredFilled}${empty}] ${percent}%`);
    };

    const steps = Math.ceil(duration / interval);
    let currentStep = 0;

    const timer = setInterval(() => {
        currentStep++;
        const percent = Math.min(Math.round((currentStep / steps) * 100), 100);
        drawProgress(percent);

        if (currentStep >= steps) {
            clearInterval(timer);
            stdout.write('\nDone!\n');
        }
    }, interval);
};

progress();
