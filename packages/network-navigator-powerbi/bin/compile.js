const exec = require('child_process').exec;
const { spawn } = require('child_process');
// const isWin = /^win/.test(process.platform);
const baseExec = `${__dirname}/../node_modules/typescript/bin/tsc`;
const tsc = spawn("node", [baseExec]);

let hasErrors = false;
function checkAndLog(data) {
    data = (data || "") + "";
    if (data.match(/\w/g) && data.indexOf("node_modules") < 0) {
        console.log(data);
        hasErrors = true;
    }
}

tsc.stdout.on('data', checkAndLog);
tsc.stderr.on('data', checkAndLog);

tsc.on('close', (code) => {
    if (hasErrors) {
        process.exit(code);
    }
});