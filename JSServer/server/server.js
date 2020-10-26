const fs = require('fs');
const parser2 = require('./parser/grammar');

fs.readFile('input.java', (err, data) => {
    if (err) throw err;
    parser2.parse(data.toString());
});