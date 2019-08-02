const fs = require('fs');
const shell = require('shelljs');
const minimist = require('minimist');

const config = require('./config.json');

class Logger {
    constructor() {
        Logger.silent = false;   
    }
    static info(msg, cargo) {
        if(!Logger.silent) {
            if (!!cargo) {
                console.log(msg, cargo);
            } else {
                console.log(msg);
            }
        }
    }
}

class Actions {
    static remakeDest(env) {
        Logger.info('Remove directory at', env.dest);
        shell.rm('-rf', env.dest);

        Logger.info('Make new directory at', env.dest);
        shell.mkdir('-p', env.dest);
    }
    static makeDir(env, dir) {
        Logger.info('Make new directory at', env.dest + dir);
        shell.mkdir('-p', env.dest + dir);
    }
    static copyPkg(env, pkg) {
        Logger.info('Copy package files and directories to', env.dest);
        for (let i = 0; i < pkg.length; i++) {
            shell.cp('-R', env.src + pkg[i], env.dest + pkg[i]);
        }
    }
    static consolidateCode(env, code) {
        Logger.info('Create code-base directory at', env.dest);
        shell.mkdir(env.dest + code.directory);

        Logger.info('Consolidate code-base files into single file');
        let codebase = [];
        for (let i = 0; i < code.files.length; i++) {
            codebase.push(env.src + code.directory + code.files[i]);
        }
        shell.cat(codebase).to(env.dest + code.directory + code.consolidate);
    }
    static replaceText(env, file, oldtext, newtext) {
        Logger.info('Replace text in', file);
        shell.sed('-i', oldtext, newtext, env.dest + file);
    }
    static renameDir(env, oldname, newname) {
        Logger.info('Rename directory', {'from': oldname, 'to': newname});
        shell.mv(env.dest + oldname, env.dest + newname);
    }
}

function taskEval(env, str) {
    if (str.indexOf('->') >= 0) {
        let tokens = str.split('->');
        let action = tokens[0].trim();
        let params = tokens[1].split(/(,\s*)/);
        for (let i = 0; i < params.length; i++) {
            params[i] = params[i].trim();
            if (params[i] == ',') {
                params.splice(i,1);
            } else {
                if (params[i].indexOf('root') >= 0) {
                    params[i] = eval(params[i].replace('root', 'config'));
                }
            }
        }
        params.splice(0, 0, env);
        Actions[action].apply(null, params);
    } else {
        console.error('Error: Invalid task statement.\n (at taskEval)', str);
    }
}

console.log('Builder   ver 1.2');

var argv = minimist(process.argv.slice(2));

if (argv.h || argv.help) {
    console.log(`
 Options:
   --help     -h        Help
   --publish  -p        Publish build for production
   --silent   -s        Hide console logs
   --watch    -w        Watch & build for development
	`);
} else if (argv.p || argv.publish) {
    Logger.silent = (argv.s || argv.silent);
    Logger.info('Generating build for production');
    let environment = {
        src: config.source,
        dest: config.build.production.destination
    };
    for (let i = 0; i < config.build.production.task.length; i++) {
        Logger.info('\nTask#' + (i + 1), config.build.production.task[i]);
        taskEval(environment, config.build.production.task[i]);
    }
} else if (argv.w || argv.watch) {
    Logger.silent = (argv.s || argv.silent);
    Logger.info('Generating build for development');
    let environment = {
        src: config.source,
        dest: config.build.development.destination
    };
    for (let i = 0; i < config.build.development.task.length; i++) {
        Logger.info('\nTask#' + (i + 1), config.build.development.task[i]);
        taskEval(environment, config.build.development.task[i]);
    }
}

console.log('\nDone!');
process.exit(1);