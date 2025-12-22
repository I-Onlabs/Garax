import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/GameRefactored.js',
  output: {
    file: 'dist/game.js',
    format: 'es',
    sourcemap: !isProduction,
    name: 'GaraxGame'
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead']
          },
          modules: false
        }]
      ]
    }),
    ...(isProduction ? [terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    })] : []),
    copy({
      targets: [
        { src: 'public/**/*', dest: 'dist' },
        { src: 'src/styles/**/*', dest: 'dist/styles' }
      ]
    })
  ],
  external: [
    // Mark dependencies as external if they should not be bundled
  ],
  onwarn(warning, warn) {
    // Suppress certain warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'UNRESOLVED_IMPORT') return;
    warn(warning);
  }
};