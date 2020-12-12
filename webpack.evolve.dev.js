var path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
    path: path.resolve(__dirname, 'evolve'),
        filename: 'main.js'
    }
};