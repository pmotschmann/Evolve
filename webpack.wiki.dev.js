var path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/wiki/wiki.js',
    performance: {
        maxAssetSize: 2_500_000,       // silence half of the 244k webpack warnings
        maxEntrypointSize: 2_500_000   // and the other half
    },
    output: {
        path: path.resolve(__dirname, 'wiki'),
        filename: 'wiki.js'
    }
};