var regex = new RegExp("\\bpowerbi-visuals.d.ts\\b");

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        chunk = chunk.split('\n\n').filter(msg => { return !regex.test(msg) }).join('\n\n');
        process.stdout.write(`${chunk}`);
    }
});

process.stdin.on('end', () => {
    process.stdout.write('end');
});


