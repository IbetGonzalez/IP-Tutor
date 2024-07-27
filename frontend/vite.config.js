import path from 'path';

export default {
    mode: "development",
    resolve: {
        alias: {
            "@util" : path.resolve(__dirname, "src/ts/util"),
        },
        extensions: [".ts", '.js'],
    },
    build: {
        outDir: "src/js",
        rollupOptions: {
            input: {
                'scripts': './src/ts/scripts.ts',
                'login/scripts':'./src/ts/login/scripts.ts'
            },
            output: {
                dir: "static/js",
                entryFileNames: '[name].bundle.js'
            }
        }
    },
}
