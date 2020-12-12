var path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/wiki/wiki.js',
    output: {
    path: path.resolve(__dirname, 'wiki'),
        filename: 'wiki.js'
    }
};