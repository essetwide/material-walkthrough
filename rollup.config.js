// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import css from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'src/MaterialWalkthrough.js',
    output: {
        file: `dist/material-walkthrough${(process.env.NODE_ENV === 'prod' ? '.min' : '')}.js`,
        format: 'umd',
    },
    plugins: [
        resolve(),
        css(),
        babel({
            exclude: 'node_modules/**' // only transpile our source code
        }),
        (process.env.NODE_ENV === 'prod' && uglify())
    ],
    name: 'MaterialWalkthrough',
    sourcemap: process.env.NODE_ENV !== 'prod',
};