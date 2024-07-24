const path = require('path');

module.exports = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    entry: {
        'scripts': './src/ts/scripts.ts',
        'login/scripts':'./src/ts/login/scripts.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'static/js'),
    },
    resolve: {
        extensions:  ['.tsx', '.ts', '.js'],
        modules: [path.resolve(__dirname, 'node_modules')],
    }
};
