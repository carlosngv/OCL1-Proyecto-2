const fs = require('fs');
const parser = require('../grammar');


fs.readFile('../input.txt', (err, data) => {
    if (err) throw err;
    parser.parse(data.toString());
});