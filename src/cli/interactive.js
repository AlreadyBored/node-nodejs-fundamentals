import readline from 'node:readline';
import { stdin, stdout } from 'node:process';

const interactive = () => {
    const rl = readline.createInterface({input: stdin, output: stdout});

    rl.setPrompt('>');
    rl.prompt();

    rl.on('line', (userInput => {
            switch (userInput) {
                case 'uptime':
                    console.log(process.uptime());
                    break;
                case 'cwd':
                    console.log(process.cwd());
                    break;
                case 'date':
                    console.log(new Date());
                    break;
                case 'exit':
                    rl.close();
                    return;
                default:
                    console.log('Unknown command');
            }        

            rl.prompt();
            }
        )
    );

    rl.on('close', () => {
        console.log('Goodbye!');
    });
};

interactive();
