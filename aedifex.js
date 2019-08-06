#!/usr/bin/env node
const fs = require('fs');
const minimist = require('minimist');
const chokidar = require('chokidar');

var actdef, config;

const appname = 'Aedifex';
const appver = '1.0.4';

class Logger {
    constructor() {
        Logger.silent = false;
    }
    static info(msg, cargo) {
        if (!Logger.silent) {
            if (!!cargo) {
                console.log(msg, cargo);
            } else {
                console.log(msg);
            }
        }
    }
    static done() {
        if (!Logger.silent) {
            let timestamp = new Date();
            console.log('Finished at', timestamp.toLocaleString());
        }
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
                params.splice(i, 1);
            } else {
                if (params[i].indexOf('root') >= 0) {
                    params[i] = eval(params[i].replace('root', 'config'));
                }
            }
        }
        params.splice(0, 0, env);
        actdef[action].apply(null, params);
    } else {
        console.error('Error: Invalid task statement.\n (at taskEval)', str);
    }
}

var argv = minimist(process.argv.slice(2));

if (argv.h || argv.help) {
    console.log(`
 Options:
   --help     -h        Help
   --version  -v        Version
   --publish  -p        Publish build for production
   --silent   -s        Hide console logs
   --watch    -w        Watch & build for development
   --config   -c        Set the config filepath
   --actdef   -a        Set the action definition filepath
    `);
} else if (argv.v || argv.version) {
    console.log(`
 ` + appname.toUpperCase() + ` 
 Version ` + appver + `
 The minimalist lightening-fast javascript task runner
    `);
} else if (argv.c || argv.config) {
    config = require(argv.c || argv.config);

    if (argv.c || argv.config) {
        actdef = require(argv.a || argv.actdef);

        if (argv.p || argv.publish) {
            Logger.silent = (argv.s || argv.silent);
            Logger.info('Generating build for production');
            let environment = {
                src: config.source,
                dest: config.build.production.destination
            };
            for (let i = 0; i < config.build.production.task.length; i++) {
                Logger.info('Task#' + (i + 1), config.build.production.task[i]);
                taskEval(environment, config.build.production.task[i]);
            }
            Logger.done();
        } else if (argv.w || argv.watch) {
            let watcher = chokidar.watch(config.source, {
                ignored: /(^|[\/\\])\../,
                ignoreInitial: true
            });
            watcher.on('all', (event, path) => {
                Logger.silent = (argv.s || argv.silent);
                Logger.info('Generating build for development');
                let environment = {
                    src: config.source,
                    dest: config.build.development.destination
                };
                for (let i = 0; i < config.build.development.task.length; i++) {
                    Logger.info('Task#' + (i + 1), config.build.development.task[i]);
                    taskEval(environment, config.build.development.task[i]);
                }
                // console.log(event, path);
                Logger.done();
            });
        }
    } else {
        Logger.info('Actdef filepath is missing');    
    }
} else {
    Logger.info('Config filepath is missing');
}