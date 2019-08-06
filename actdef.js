const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const walkDir = (dir) => {
    return fs.statSync(dir).isDirectory() ?
        Array.prototype.concat(...fs.readdirSync(dir).map(f => walkDir(path.join(dir, f)))) : dir;
}

class Actions {
    static remakeDest(env) {
        console.log('Remove directory at', env.dest);
        shell.rm('-rf', env.dest);

        console.log('Make new directory at', env.dest);
        shell.mkdir('-p', env.dest);
    }
    static makeDir(env, dir) {
        console.log('Make new directory at', env.dest + dir);
        shell.mkdir('-p', env.dest + dir);
    }
    static copyPkg(env, pkg) {
        console.log('Copy package files and directories to', env.dest);
        for (let i = 0; i < pkg.length; i++) {
            shell.cp('-R', env.src + pkg[i], env.dest + pkg[i]);
        }
    }
    static copyPkgtTo(env, pkg, dest) {
        // console.log('Copy package files and directories to', env.dest + dest);
        for (let i = 0; i < pkg.length; i++) {
            shell.cp(pkg[i], env.dest + dest);
        }
    }
    static copyFile(env, src, dest) {
        // console.log('Copy files to', { 'from': src, 'to': env.dest + dest });
        shell.cp(src, env.dest + dest);
    }
    static copyDir(env, src, dest) {
        // console.log('Copy folders to', { 'from': src, 'to': env.dest + dest });
        shell.cp('-R', src, env.dest + dest);
    }
    static consolidateCode(env, codedir, outfile) {
        // console.log('Create code-base directory at', env.dest);
        shell.mkdir(env.dest + codedir);
        let files = walkDir(env.src + codedir);
        files = files.filter(file => !!path.extname(file));
        shell.cat(files).to(env.dest + codedir + outfile);
    }
    static replaceText(env, file, oldtext, newtext) {
        console.log('Replace text in', file);
        shell.sed('-i', oldtext, newtext, env.dest + file);
    }
    static renameDir(env, oldname, newname) {
        console.log('Rename directory', { 'from': oldname, 'to': newname });
        shell.mv(env.dest + oldname, env.dest + newname);
    }
}

module.exports = Actions;