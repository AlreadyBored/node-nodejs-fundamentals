 const progress = () => {
    let args = process.argv;
    let duration = 5000;
    let interval = 100;
    let length = 30;
    let color = '';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--duration') {
            duration = Number(args[i + 1]);
        } else if (args[i] === '--interval') {
            interval = Number(args[i + 1]);
        } else if (args[i] === '--length') {
            length = Number(args[i + 1]);
        } else if (args[i] === '--color') {
            color = args[i + 1];
        }
    }

    let prefix = '';
    if (color !== '') {
        let r = parseInt(color.slice(0, 2), 16);
        let g = parseInt(color.slice(2, 4), 16);
        let b = parseInt(color.slice(4, 6), 16);
        
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            prefix = '\x1b[38;2;' + r + ';' + g + ';' + b + 'm';
        }
    }

    let totalSteps = duration / interval;
    let currentStep = 0;

    let timer = setInterval(() => {
        currentStep = currentStep + 1;
        
        let percent = Math.floor((currentStep / totalSteps) * 100);
        if (percent > 100) {
            percent = 100;
        }

        let filledCount = Math.floor((length * percent) / 100);
        let emptyCount = length - filledCount;

        let filledStr = '';
        for (let i = 0; i < filledCount; i++) {
            filledStr = filledStr + '█';
        }
        
        let emptyStr = '';
        for (let i = 0; i < emptyCount; i++) {
            emptyStr = emptyStr + ' ';
        }

        let bar = filledStr;
        if (prefix !== '') {
            bar = prefix + filledStr + '\x1b[0m';
        }

        process.stdout.write('\r[' + bar + emptyStr + '] ' + percent + '%');

        if (currentStep >= totalSteps) {
            clearInterval(timer);
            console.log('\nDone!');
        }
    }, interval);
};

progress();
