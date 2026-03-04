const progress = () => {
  const totalSteps = 50;
  const intervalMs = 100;
  const barWidth = 30;

  let step = 0;

  const render = () => {
    const percent = Math.round((step / totalSteps) * 100);
    const filled = Math.round((percent / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = `${'█'.repeat(filled)}${' '.repeat(empty)}`;

    process.stdout.write(`\r[${bar}] ${percent}%`);
  };

  render();

  const timer = setInterval(() => {
    step += 1;
    render();

    if (step >= totalSteps) {
      clearInterval(timer);
      process.stdout.write('\n');
    }
  }, intervalMs);
};

progress();
