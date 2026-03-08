const progress = () => {
  let percent = 0;
  const total = 50; // длина прогресс-бара
  const intervalTime = 5000 / 100;

  const interval = setInterval(() => {
    percent += 1;

    const filler = Math.round((percent / 100) * total);
    const bar = "█".repeat(filler) + " ".repeat(total - filler);

    process.stdout.write(`\r[${bar}] ${percent}%`);

    if (percent >= 100) {
      clearInterval(interval);
      process.stdout.write("\nThat's it!\n");
    }
  }, intervalTime);
};

progress();
