const path = require('path');

module.exports = {
    mode: "production",
    entry: {
        'scripts': './src/js/scripts.js',
        'games/tuninggame/tuninggame': './src/js/games/tuninggame/tuninggame.js',
        'login/scripts':'./src/js/login/scripts.js',
    },
    output: {
        path: path.resolve(__dirname, 'static/js'),
        filename: '[name].build.js',
    },
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules')],
    }
};
