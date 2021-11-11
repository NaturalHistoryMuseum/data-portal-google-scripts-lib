// this adapter creates a module out of the Portal Lib. We can't include a module.exports line in the actual lib
// because it makes Google cry so we have to do it here just for the tests. We could do this in the test files but doing
// it like this keeps the scopes clean and allows reuse across multiple test files.
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/../../src/Portal Lib/lib.js') + '');
module.exports = load();
