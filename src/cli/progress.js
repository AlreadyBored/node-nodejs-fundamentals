import { parseArgs } from 'util';

const progress = () => {
  const outputCfg = {
    options:{
      duration: {type: 'string', default: '5000'},
      interval: {type: 'string', default: '100'},
      length: {type: 'string', default: '30'},
      color: {type: 'string', default: ''}
    },
    values:{}
  }

  const cliValues = parseArgs(outputCfg)

  const duration = Number(cliValues.values.duration) || outputCfg.options.duration.default
  const interval = Number(cliValues.values.interval) || outputCfg.options.interval.default
  const length = Number(cliValues.values.length) || outputCfg.options.length.default
  var color = ''

  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (hexPattern.test(cliValues.values.color)){
    const r = parseInt(cliValues.values.color.slice(1, 3), 16);
    const g = parseInt(cliValues.values.color.slice(3, 5), 16);
    const b = parseInt(cliValues.values.color.slice(5, 7), 16);
    color = `\x1b[38;2;${r};${g};${b}m`
  }
  
  var filled = 0
  var renderedFilling = 0
  var empty = length

  const step = length/(duration/interval);

  const countRatio = setInterval(() =>{
    filled += step
    renderedFilling = Math.floor(filled)
    empty = length - renderedFilling
    process.stdout.write( color + `\r[${'█'.repeat(renderedFilling)}${' '.repeat(empty)}] ${Math.round((filled/length)*100)}%` + '\x1b[0m' )
    if (renderedFilling === length){
      clearInterval(countRatio)
      console.log("\nDone! ", empty)
    }
  }, interval)
};

progress();
