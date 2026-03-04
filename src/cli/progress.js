const DEFAULTS = {
  duration: 5000,
  interval: 100,
  length: 30,
  color: null,
}


const progress = () => {
  const args = process.argv.slice(2)
  const duration = args[args.indexOf('--duration') + 1] || DEFAULTS.duration
  const interval = args[args.indexOf('--interval') + 1] || DEFAULTS.interval
  const length = args[args.indexOf('--length') + 1] || DEFAULTS.length
  const color = args[args.indexOf('--color') + 1] || DEFAULTS.color
  const RESET_COLOR = '\x1b[0m'

  const totalTicks = Math.ceil(duration / interval);
  const codeColor = hexToAnsi(color)
  let currentTick = 0;

  const processInterval = setInterval(() => {
    currentTick++;
    const progress = Math.min(currentTick / totalTicks, 1)
    const percent = Math.floor(progress * 100)

    const filledLength = Math.floor(progress * length)
    const emptyLength = length - filledLength

    const filled = '█'.repeat(filledLength)
    const empty = ' '.repeat(emptyLength)

    const coloredFilled = codeColor ? codeColor + filled + RESET_COLOR : filled

    const line = `[${coloredFilled}${empty}] ${percent}%`

    process.stdout.write(`\r${line}`)
    if (currentTick >= totalTicks) {
      clearInterval(processInterval)
      process.stdout.write('\nDone!\n')
    }
  }, interval)
};

progress();



function hexToAnsi(hex) {
  if (!hex || hex.length !== 7 || !/^#[0-9a-fA-F]{6}$/.test(hex) || hex.split('').filter(a => a === '#').length > 1) return ''
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `\x1b[38;2;${r};${g};${b}m`
}
