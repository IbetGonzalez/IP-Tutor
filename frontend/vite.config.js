import path from 'path';

export default {
    mode: "development",
    resolve: {
        alias: {
            "@util" : path.resolve(__dirname, "src/ts/util"),
            "@components" : path.resolve(__dirname, "src/ts/components")
        },
        extensions: [".ts", '.js'],
    },
    build: {
        outDir: "static",
        emptyOutDir: false,
        rollupOptions: {
            input: {
                'scripts': './src/ts/scripts.ts',
                'login/scripts': './src/ts/pages/login.ts',
                'register/scripts': './src/ts/pages/register.ts'
            },
            output: {
                dir: "static",
                entryFileNames: 'js/[name].bundle.js'
            }
        }
    },
}
