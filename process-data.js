const fs = require('fs');
const readline = require('readline');


const folder = './data/';
const data = {}

const releaseTime = 1664229600

fs.readdir(folder, async (err, files) => {
    for await (const file of files) {
        console.log(`Processing ${file}`);
        const fileStream = fs.createReadStream(`${folder}${file}`);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        for await (const line of rl) {
            const [name, className, ...levelsInfo] = line.split(';')
            data[name] = data[name] || {}
            data[name].className = className
            data[name].levels = data[name].levels || {}

            for (const levelInfo of levelsInfo) {
                const [level, timeString] = levelInfo.split('-')
                let time = Number.parseInt(timeString)
                if(level == 70 && time < releaseTime + 3600*24) {
                    time = releaseTime
                }
                if (data[name].levels[level]) {
                    data[name].levels[level] = Math.min(data[name].levels[level], time)
                } else {
                    data[name].levels[level] = time
                }
            }
        }
    }
    for await (const name of Object.keys(data)) {
        let maxLevel = 70;
        for (const level of Object.keys(data[name].levels)) {
            maxLevel = Math.max(maxLevel, level)
        }
        if(maxLevel <= 70) {
            delete data[name]
        }
    }
    const writeStream = fs.createWriteStream("data.js");
    writeStream.once('open', function(fd) {
        writeStream.write("const graphData = ");
        writeStream.write(JSON.stringify(data));
        writeStream.end();
    });
    console.log('done')
});
