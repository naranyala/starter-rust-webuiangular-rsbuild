import { defineConfig } from '@rsbuild/core';
import { pluginSass } from '@rsbuild/plugin-sass';

/**
 * Rsbuild configuration for Angular 19 with bleeding-edge optimizations
 *
 * Features:
 * - Zoneless-ready configuration
 * - Code splitting for Angular vendor chunks
 * - Tree-shaking optimizations
 * - Modern ES2022 target
 */
const config = defineConfig({
  source: {
    entry: {
      main: './src/main.ts',
    },
    include: [/src/],
    // Define global constants for Angular optimizations
    define: {
      'ngDevMode': 'false',
      'ngJitMode': 'false',
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json'],
    // Path aliases for cleaner imports
    alias: {
      '@': './src',
      '@models': './src/models',
      '@viewmodels': './src/viewmodels',
      '@views': './src/views',
      '@core': './src/core',
      '@environments': './src/environments',
    },
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
    // Optimize CSS extraction
    legalComments: 'none',
    // Target modern browsers (ES2022)
    overrideBrowserslist: ['Chrome >= 109', 'Edge >= 109', 'Safari >= 16.2'],
  },
  tools: {
    rspack: {
      optimization: {
        minimize: true,
        // Smart code splitting for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Angular framework chunk
            angular: {
              test: /[\\/]node_modules[\\/]@angular[\\/]/,
              name: 'angular',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
            // RxJS chunk
            rxjs: {
              test: /[\\/]node_modules[\\/]rxjs[\\/]/,
              name: 'rxjs',
              chunks: 'all',
              priority: 19,
              reuseExistingChunk: true,
            },
            // Other vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        // Deterministic IDs for better caching
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        // Remove unused exports
        usedExports: true,
        // Merge identical modules
        mergeDuplicateChunks: true,
        // Remove parent modules with no effect
        removeParentModules: true,
      },
      // Enable future optimizations
      experiments: {
        rspackFuture: {
          bundlerInfo: {
            force: false,
          },
          // Enable lazy compilation for faster dev
          lazyCompilation: false,
        },
      },
    },
    // Sass configuration
    sass: {
      sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  html: {
    template: './src/index.html',
    // Use module loading for modern browsers
    scriptLoading: 'module',
    inject: 'body',
    // Minify HTML
    minify: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
    },
  },
  server: {
    port: 4200,
    historyApiFallback: true,
    hmr: true,
    // Enable lazy compilation in dev
    lazyCompilation: true,
  },
  performance: {
    // Smart chunk splitting
    chunkSplit: {
      strategy: 'split-by-experience',
    },
    // Remove console.log in production
    removeConsole: {
      includes: ['log', 'debug', 'info', 'warn', 'error'],
    },
    // Bundle size limits
    bundleAnalyze: {
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
    },
  },
  plugins: [
    pluginSass(),
  ],
});

export default config;
