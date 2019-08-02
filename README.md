# Aedifex
The minimalist JavaScript task runner

### Setup
Pre-requisite is node.js along with npm
```
$ npm install
```

### Usage CLI Options
The configuration file is required to be passed for generating the development or production builds. So modify the sample `config.json` as per your need.

Don not modify the structure of the sample `config.json`, but the tasks can be made in this format 
```
action -> param1, param2, ..., paramN
```

In the `aedifex.js` file, we have `Actions` class, so each task have the action which maps with the static methods present in the class and the params are mapped with the arguments of those methods.

Since the tasks are listed under an array, so they can be repeated with same or different params. If there is no params required for method then just leave the portion as blank after arrow.

Finally, run the below commands when ready.

#### Help
Prints the available switches and options.
```
$ node aedifex.js -h

 Options:
   --help     -h        Help
   --version  -v        Version
   --publish  -p        Publish build for production
   --silent   -s        Hide console logs
   --watch    -w        Watch & build for development
   --config   -c        Set the config filepath

```

#### Version
Prints the application name, version, description and license information.
```
$ node aedifex.js -v

 AEDIFEX 
 Version 1.0.0
 The minimalist javascript task runner

```

#### Publish
To produce build for distribution.
```
node aedifex.js -c ./config.json -p
Generating build for production
.
.
.
Finished at 8/2/2019, 3:00:17 PM
```

#### Watcher
To re-build for development whenever any file changes under watching folder.
```
node aedifex.js -c ./config.json -w
Generating build for development
.
.
.
Finished at 8/2/2019, 3:00:17 PM
```

#### Silent
This switch can go with other switches but when used will not show any logs other than system errors.
```
node aedifex.js -c ./config.json -w -s
```
