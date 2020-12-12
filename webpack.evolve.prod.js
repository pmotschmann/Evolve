var path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/main.js',
    output: {
    path: path.resolve(__dirname, 'evolve'),
        filename: 'main.js'
    }
};