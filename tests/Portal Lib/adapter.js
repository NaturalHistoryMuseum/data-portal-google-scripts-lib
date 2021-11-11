const fs = require('fs');
eval(fs.readFileSync(__dirname + '/../../src/Portal Lib/lib.js') + '');
module.exports = load();
