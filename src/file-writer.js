const fs = require("fs").promises;

async function filewriter(path, buffer){
    return fs.writeFile(path, buffer);
}

module.exports = filewriter;