#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const chokidar = require('chokidar');

var actdef, config;

const appname = 'Aedifex';
const appver = '1.0.5';

class Duration {
    static asTimeObj(seconds) {
        let hr = Math.floor(seconds / 3600);
        let min = Math.floor(seconds % 3600 / 60);
        let sec = seconds % 3600 % 60;
        return {
            'h': hr,
            'm': min,
            's': sec
        };
    }
    static format(time) {
        let o = [];
        if (time.h > 0)
            o.push(time.h + 'h');
        if (time.m > 0)
            o.push(time.m + 'm');
        if (time.s > 0)
            o.push(time.s + 's');
        return o.join('');
    }
}

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
    static done(startTime) {
        if (!Logger.silent) {
            let o = 'Finished';
            let endTime = new Date();
            if (!!startTime) {
                let duration = (endTime - startTime) / 1000;
                o += ' in ' + Duration.format(Duration.asTimeObj(duration));
            }
            o += ' at ' + endTime.toLocaleString();
            console.log(o + '\n');
        }
    }
}

class Evaluate {
    static task(env, str) {
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
            console.error('Error: Invalid task statement.\n (at Evaluate.task)', str);
        }
    }
}

var argv = minimist(process.argv.slice(2));

if (argv.h || argv.help) {
    console.log(`
 Options:
   --help     -h        Help
   --version  -v        Version
   --publish  -p        Publish build for production
   --watch    -w        Watch & build for development

 Sub-options:
   --silent   -s        Hide console logs (optional)
   --config   -c        Set the config filepath [=config.json]
   --actdef   -a        Set the action definition filepath [=actdef.js]
    `);
} else if (argv.v || argv.version) {
    console.log(`
 ` + appname.toUpperCase() + ` 
 Version ` + appver + `
 The minimalist lightening-fast javascript task runner
    `);
} else if (argv.p || argv.publish) {
    if (argv.c || argv.config) {
        config = require(argv.c || argv.config);

        if (argv.a || argv.actdef) {
            actdef = require(argv.a || argv.actdef);

            Logger.silent = (argv.s || argv.silent);
            Logger.info('Generating build for production');
            let startTime = new Date();
            let environment = {
                src: config.source,
                dest: config.build.production.destination
            };
            for (let i = 0; i < config.build.production.task.length; i++) {
                Logger.info('Task#' + (i + 1), config.build.production.task[i]);
                Evaluate.task(environment, config.build.production.task[i]);
            }
            Logger.done(startTime);
        } else {
            Logger.info(' Error: Action-definition (actdef.js) file path is missing');
        }
    } else {
        Logger.info(' Error: Configuration (config.json) file path is missing');
    }
} else if (argv.w || argv.watch) {
    if (argv.c || argv.config) {
        config = require(argv.c || argv.config);

        if (argv.a || argv.actdef) {
            actdef = require(argv.a || argv.actdef);

            Logger.silent = (argv.s || argv.silent);
            Logger.info('Generating build for development');
            let startTime = new Date();
            var environment = {
                src: config.source,
                dest: config.build.development.destination
            };
            for (let i = 0; i < config.build.development.task.length; i++) {
                Logger.info('Task#' + (i + 1), config.build.development.task[i]);
                Evaluate.task(environment, config.build.development.task[i]);
            }
            Logger.done(startTime);

            let watcher = chokidar.watch(config.source, {
                ignored: /(^|[\/\\])\../,
                ignoreInitial: true
            });
            watcher.on('all', (event, path) => {
                Logger.info(event, path);
                Logger.info('Rebuilding ...');
                let startTime = new Date();
                for (let i = 0; i < config.build.development.task.length; i++) {
                    Logger.info('Task#' + (i + 1), config.build.development.task[i]);
                    Evaluate.task(environment, config.build.development.task[i]);
                }
                Logger.done(startTime);
            });
        } else {
            Logger.info(' Error: Action-definition (actdef.js) file path is missing');
        }
    } else {
        Logger.info(' Error: Configuration (config.json) file path is missing');
    }
} else {
    Logger.info(' Error: Option is missing in command-line arguments');
}