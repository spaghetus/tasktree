import { stdin, stdout, stderr } from 'process';
import chalk from 'chalk';
import readline from 'readline';
import chalkAnimation from 'chalk-animation';
import fs from 'fs';
import core, { Task } from './Core.js';
import { inflate } from 'zlib';

const taglines = [
    'Made for Stormhacks 2022!',
    'Pomodoro means Tomato!',
    'the real tree was inside us all along'
];

var config;
if (!fs.existsSync(`${core.configPath}/tasktree.config`)) {
    config = new core.Config();
    config.save();

}
else {
    inflate(fs.readFileSync(`${core.configPath}/tasktree.config`), (e, r) => {
        config = new core.Config(JSON.parse(r.toString()));
        config.save();
    });
}

/**
 * @function ask ask the user a question in the command line
 * @param {String} q what to ask the user
 * @returns {String} The user's response
 */
function ask(q) {
    const rl = readline.createInterface({
        input: stdin,
        output: stdout
    });

    return new Promise((res, _) => {
        rl.question(`${q}\n>`, ans => {
            stdout.cursorTo(0);
            stdout.moveCursor(0, -1);
            res(ans);
        });
    });
}

(async() => {
    stdout.write(chalk.green(`
     _____          _    _                 
    /__   \\__ _ ___| | _| |_ _ __ ___  ___ 
      / /\\/ _\` / __| |/ / __| '__/ _ \\/ _ \\
     / / | (_| \\__ \\   <| |_| | |  __/  __/
     \\/   \\__,_|___/_|\\_\\\\__|_|  \\___|\\___|
                                           \n`));
    let tagline = chalkAnimation.rainbow(taglines[Math.floor(Math.random() * taglines.length)]);
    stdout.write(tagline.frame());
    await new Promise((res, _) => {
        setTimeout(() => {
            tagline.stop();
            stdout.moveCursor(0, -1);
            stdout.write(chalk.bgWhite.black(tagline.text));
            stdout.write('\n');
            res();
        }, 2000);
    });
    ask(`
    Main Menu
    1) New Task
    2) View Tasks
    3) Start Working`).then((opt) => {
        let options = [
            'New Task',
            'View Tasks',
            'Start Working'
        ];
        try {(parseInt(opt));} catch(e) {process.exit(e);}
        switch (parseInt(opt)) {
            case 1:
                stdout.write(chalk.bgWhite.black(options[0]));
                break;
            case 2:
                stdout.write(chalk.bgWhite.black(options[1]));
                break;
            case 3:
                stdout.write(chalk.bgWhite.black(options[2]));
                break;
            default:
                stdout.write(chalk.red('Invalid option'));
                process.exit(1);
        }
    });
})();