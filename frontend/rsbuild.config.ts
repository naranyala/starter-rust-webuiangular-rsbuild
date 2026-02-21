import { defineConfig } from '@rsbuild/core';
import { pluginSass } from '@rsbuild/plugin-sass';

/**
 * Rsbuild configuration for Angular 19 with Bun runtime
 * 
 * This configuration replaces Rspack with Rsbuild for faster builds
 * while maintaining compatibility with Angular's requirements.
 */
export default defineConfig({
  source: {
    entry: {
      main: './src/main.ts',
    },
    include: [/src/],
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json'],
  },
  output: {
    distPath: {
      root: './dist',
      js: './static/js',
      css: './static/css',
    },
    filename: {
      js: '[name].[contenthash:8].js',
      css: '[name].[contenthash:8].css',
    },
    cleanDistPath: true,
    dataUriLimit: {
      image: 4096,
      media: 4096,
    },
    copy: [
      { from: './src/favicon.ico' },
      { from: './src/assets', to: 'assets' },
    ],
  },
  tools: {
    rspack: {
      optimization: {
        minimize: true,
        splitChunks: false,
      },
      experiments: {
        rspackFuture: {
          bundlerInfo: {
            force: false,
          },
        },
      },
    },
  },
  html: {
    template: './src/index.html',
    scriptLoading: 'defer',
    inject: 'body',
  },
  server: {
    port: 4200,
    historyApiFallback: true,
    hmr: true,
  },
  performance: {
    chunkSplit: false,
  },
  plugins: [
    pluginSass(),
  ],
});
