var path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/main.js',
    performance: {
        maxAssetSize: 2_500_000,       // silence half of the 244k webpack warnings
        maxEntrypointSize: 2_500_000   // and the other half
    },
    output: {
        path: path.resolve(__dirname, 'evolve'),
        filename: 'main.js'
    }
};