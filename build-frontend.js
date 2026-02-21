#!/usr/bin/env bun

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const QUIET = process.argv.includes('--quiet') || process.argv.includes('-q');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

class BuildLogger {
  constructor() {
    this.steps = [];
    this.currentStep = null;
    this.startTime = Date.now();
    this.warnings = [];
    this.errors = [];
  }

  get timestamp() {
    return new Date().toISOString();
  }

  log(level, message, meta = {}) {
    const entry = { timestamp: this.timestamp, level, message, meta };
    
    if (!QUIET) {
      const color = this.getLevelColor(level);
      const prefix = this.getLevelPrefix(level);
      console.log(`${color}${prefix}${colors.reset} ${message}`);
    }
  }

  getLevelColor(level) {
    const colorsByLevel = {
      DEBUG: colors.gray,
      INFO: colors.blue,
      WARN: colors.yellow,
      ERROR: colors.red,
      SUCCESS: colors.green,
      STEP: colors.cyan
    };
    return colorsByLevel[level] || colors.white;
  }

  getLevelPrefix(level) {
    const prefixes = {
      DEBUG: '[DEBUG]',
      INFO: '[INFO]',
      WARN: '[WARN]',
      ERROR: '[ERROR]',
      SUCCESS: '[✓]',
      STEP: '[STEP]'
    };
    return prefixes[level] || '[LOG]';
  }

  debug(message) { this.log('DEBUG', message); }
  info(message) { this.log('INFO', message); }
  warn(message) { this.log('WARN', message); }
  error(message) { this.log('ERROR', message); }
  success(message) { this.log('SUCCESS', message); }

  startStep(name, description = '') {
    const step = { name, description, startTime: Date.now(), status: 'running' };
    this.currentStep = step;
    this.steps.push(step);
    this.log('STEP', `Starting: ${name}${description ? ` - ${description}` : ''}`);
    return step;
  }

  stepLog(message, level = 'INFO') {
    if (this.currentStep) {
      if (level === 'WARN') this.warnings.push({ step: this.currentStep.name, message });
      if (level === 'ERROR') this.errors.push({ step: this.currentStep.name, message });
      this.log(level, `  ${message}`);
    }
  }

  endStep(success = true, error = null) {
    if (this.currentStep) {
      const duration = Date.now() - this.currentStep.startTime;
      this.currentStep.duration = duration;
      this.currentStep.status = success ? 'success' : 'failed';
      
      const statusText = success ? 'completed' : 'failed';
      if (success) {
        this.log('SUCCESS', `Finished: ${this.currentStep.name} (${duration}ms)`);
      } else {
        this.log('ERROR', `Failed: ${this.currentStep.name} - ${error?.message || 'Unknown error'}`);
      }
      this.currentStep = null;
    }
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const successfulSteps = this.steps.filter(s => s.status === 'success').length;
    const failedSteps = this.steps.filter(s => s.status === 'failed').length;

    console.log('\n' + colors.bright + '='.repeat(60) + colors.reset);
    console.log(colors.bright + 'BUILD SUMMARY' + colors.reset);
    console.log(colors.bright + '='.repeat(60) + colors.reset);
    console.log(`  Total Duration: ${totalDuration}ms`);
    console.log(`  Steps: ${successfulSteps} successful, ${failedSteps} failed, ${this.steps.length} total`);
    console.log(colors.bright + '='.repeat(60) + colors.reset + '\n');

    return { success: failedSteps === 0, totalDuration, steps: this.steps };
  }
}

const logger = new BuildLogger();

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function buildFrontend() {
  logger.info('Starting frontend build');

  const originalDir = process.cwd();
  const projectRoot = path.resolve(__dirname);
  const frontendDir = path.join(projectRoot, 'frontend');
  const distPath = path.join(frontendDir, 'dist');

  // Ensure project root directories exist (not symlinks)
  const rootDist = path.join(projectRoot, 'dist');
  const rootStatic = path.join(projectRoot, 'static');
  const rootStaticJs = path.join(rootStatic, 'js');
  const rootStaticCss = path.join(rootStatic, 'css');

  try {
    // Check if rootDist or rootStatic are symlinks and remove them
    for (const dir of [rootDist, rootStatic]) {
      try {
        const stat = await fs.lstat(dir);
        if (stat.isSymbolicLink()) {
          await fs.unlink(dir);
          logger.debug(`Removed symlink: ${dir}`);
        }
      } catch {
        // Directory doesn't exist, will create it
      }
    }

    // Create required directories
    await fs.mkdir(rootStaticJs, { recursive: true });
    await fs.mkdir(rootStaticCss, { recursive: true });
    await fs.mkdir(path.join(rootDist, 'static', 'js'), { recursive: true });
    await fs.mkdir(path.join(rootDist, 'static', 'css'), { recursive: true });

    process.chdir(frontendDir);

    // Step 1: Install dependencies
    logger.startStep('dependencies', 'Installing frontend dependencies');
    try {
      await fs.access('node_modules');
      logger.stepLog('Dependencies already installed');
    } catch {
      logger.stepLog('Installing dependencies with bun...');
      execSync('bun install', { stdio: VERBOSE ? 'inherit' : 'pipe' });
      logger.stepLog('Dependencies installed');
    }
    logger.endStep(true);

    // Step 2: Build with Rsbuild
    logger.startStep('rsbuild', 'Running Rsbuild build');
    try {
      const buildStart = Date.now();
      execSync('bun run build', { stdio: VERBOSE ? 'inherit' : 'pipe', cwd: frontendDir });
      const buildDuration = Date.now() - buildStart;
      logger.stepLog(`Rsbuild completed in ${buildDuration}ms`);
    } catch (buildError) {
      logger.stepLog(`Build failed: ${buildError.message}`, 'ERROR');
      logger.endStep(false, buildError);
      throw buildError;
    }
    logger.endStep(true);

    // Step 3: Copy assets to project root dist/ and static/
    logger.startStep('copy-assets', 'Copying built assets');

    const rsbuildOutputDir = path.join(frontendDir, 'dist');
    const distStaticJs = path.join(rootDist, 'static', 'js');
    const distStaticCss = path.join(rootDist, 'static', 'css');

    // Rsbuild may output to dist/browser/ or dist/static/js/ - check both
    let browserDir = path.join(rsbuildOutputDir, 'browser');
    let rsbuildJsDir = path.join(rsbuildOutputDir, 'static', 'js');
    let rsbuildCssDir = path.join(rsbuildOutputDir, 'static', 'css');
    
    // Check if browser directory exists (Angular build output)
    const hasBrowserDir = await pathExists(browserDir);
    if (hasBrowserDir) {
      // Angular-style output: dist/browser/
      rsbuildJsDir = browserDir;
      rsbuildCssDir = browserDir;
    }

    // Find JS files in Rsbuild output
    const allJsFiles = await fs.readdir(rsbuildJsDir);
    // Look for main.*.js files (Angular build output)
    const entryJsFiles = allJsFiles.filter(f => 
      f.startsWith('main-') && f.endsWith('.js') && !f.endsWith('.map')
    );
    const chunkFiles = allJsFiles.filter(
      f => /^[A-Z0-9]+\.[a-f0-9]+\.js$/.test(f) && !f.endsWith('.map')
    );

    if (entryJsFiles.length === 0) {
      // Fallback: look for any *.js file that's not polyfills or scripts
      const mainFiles = allJsFiles.filter(f => 
        f.startsWith('main') && f.endsWith('.js') && !f.endsWith('.map')
      );
      if (mainFiles.length > 0) {
        entryJsFiles.push(...mainFiles);
      }
    }

    if (entryJsFiles.length === 0) {
      throw new Error('No entry JS file found in Rsbuild output. Available files: ' + allJsFiles.join(', '));
    }

    const entryJsFile = entryJsFiles[0];

    // Copy entry JS file as main.js AND keep original name
    const entrySrc = path.join(rsbuildJsDir, entryJsFile);
    const mainDestJs = path.join(distStaticJs, 'main.js');
    const mainDestRootJs = path.join(rootStaticJs, 'main.js');
    const originalDestJs = path.join(distStaticJs, entryJsFile);
    const originalDestRootJs = path.join(rootStaticJs, entryJsFile);
    
    await fs.copyFile(entrySrc, mainDestJs);
    await fs.copyFile(entrySrc, mainDestRootJs);
    await fs.copyFile(entrySrc, originalDestJs);
    await fs.copyFile(entrySrc, originalDestRootJs);
    logger.stepLog(`Copied ${entryJsFile} as main.js and kept original name`);

    // Copy chunk files
    for (const chunkFile of chunkFiles) {
      const src = path.join(rsbuildJsDir, chunkFile);
      await fs.copyFile(src, path.join(distStaticJs, chunkFile));
      await fs.copyFile(src, path.join(rootStaticJs, chunkFile));
    }
    if (chunkFiles.length > 0) {
      logger.stepLog(`Copied ${chunkFiles.length} chunk files`);
    }

    // Copy CSS files
    const cssFiles = [];
    try {
      const cssFileList = await fs.readdir(rsbuildJsDir);
      for (const f of cssFileList.filter(f => f.endsWith('.css') && !f.endsWith('.map'))) {
        const src = path.join(rsbuildJsDir, f);
        await fs.copyFile(src, path.join(distStaticCss, f));
        await fs.copyFile(src, path.join(rootStaticCss, f));
        cssFiles.push(f);
      }
    } catch {
      // CSS directory may not exist or have no CSS
    }
    if (cssFiles.length > 0) {
      logger.stepLog(`Copied ${cssFiles.length} CSS files`);
    }

    // Also copy from browser directory if it exists (Angular build output)
    if (hasBrowserDir) {
      try {
        const browserFiles = await fs.readdir(browserDir);
        for (const f of browserFiles.filter(f => f.endsWith('.css') && !f.endsWith('.map'))) {
          const src = path.join(browserDir, f);
          if (!cssFiles.includes(f)) {
            await fs.copyFile(src, path.join(distStaticCss, f));
            await fs.copyFile(src, path.join(rootStaticCss, f));
            cssFiles.push(f);
          }
        }
        if (cssFiles.length > 0) {
          logger.stepLog(`Copied additional CSS files from browser/`);
        }
      } catch {
        // Browser directory may not have CSS
      }
    }

    // Step 4a: Copy winbox.min.js and winbox.min.css from node_modules
    logger.startStep('copy-winbox', 'Copying WinBox');
    const winboxJsSrc = path.join(frontendDir, 'node_modules', 'winbox', 'dist', 'winbox.bundle.min.js');
    const winboxCssSrc = path.join(frontendDir, 'node_modules', 'winbox', 'dist', 'css', 'winbox.min.css');
    const winboxJsDest1 = path.join(rootStaticJs, 'winbox.min.js');
    const winboxJsDest2 = path.join(distStaticJs, 'winbox.min.js');
    const winboxCssDest1 = path.join(rootStaticCss, 'winbox.min.css');
    const winboxCssDest2 = path.join(distStaticCss, 'winbox.min.css');

    if (await pathExists(winboxJsSrc)) {
      await fs.copyFile(winboxJsSrc, winboxJsDest1);
      await fs.copyFile(winboxJsSrc, winboxJsDest2);
      logger.stepLog('Copied winbox.min.js');
    } else {
      logger.stepLog('Warning: winbox.min.js not found', 'WARN');
    }

    if (await pathExists(winboxCssSrc)) {
      await fs.copyFile(winboxCssSrc, winboxCssDest1);
      await fs.copyFile(winboxCssSrc, winboxCssDest2);
      logger.stepLog('Copied winbox.min.css');
    } else {
      logger.stepLog('Warning: winbox.min.css not found', 'WARN');
    }
    logger.endStep(true);

    // Step 4b: Copy webui.js
    logger.startStep('copy-webui', 'Copying WebUI bridge');
    const webuiSrc = path.join(projectRoot, 'thirdparty', 'webui-c-src', 'bridge', 'webui.js');
    const webuiDest = path.join(rootStaticJs, 'webui.js');
    if (await pathExists(webuiSrc)) {
      await fs.copyFile(webuiSrc, webuiDest);
      await fs.copyFile(webuiSrc, path.join(distStaticJs, 'webui.js'));
      logger.stepLog('Copied webui.js');
    } else {
      logger.stepLog('Warning: webui.js not found at ' + webuiSrc, 'WARN');
    }
    logger.endStep(true);

    // Step 5: Copy index.html from Rsbuild output and fix paths
    logger.startStep('copy-html', 'Copying and fixing index.html');

    // Check for index.html in browser directory or root dist
    let rsbuildIndex = path.join(browserDir, 'index.html');
    if (!await pathExists(rsbuildIndex)) {
      rsbuildIndex = path.join(rsbuildOutputDir, 'index.html');
    }
    const rootIndexHtml = path.join(rootDist, 'index.html');

    if (await pathExists(rsbuildIndex)) {
      // Read the index.html and fix paths
      let htmlContent = await fs.readFile(rsbuildIndex, 'utf-8');
      
      // Fix base href
      htmlContent = htmlContent.replace(/<base href="[^"]*">/, '<base href="./">');
      
      // Fix CSS paths - add static/css/ prefix
      htmlContent = htmlContent.replace(
        /href="([^"]*\.css)"/g,
        (match, p1) => {
          if (p1.startsWith('static/') || p1.startsWith('./')) {
            return match;
          }
          return `href="./static/css/${p1}"`;
        }
      );
      
      // Fix JS paths - add static/js/ prefix AND ensure winbox loads first
      let winboxScript = '<script src="./static/js/winbox.min.js"></script>\n  ';
      htmlContent = htmlContent.replace(
        /src="([^"]*\.js)"/g,
        (match, p1) => {
          if (p1.startsWith('static/') || p1.startsWith('./')) {
            return match;
          }
          // Don't add prefix to winbox.min.js as we'll add it separately
          if (p1.includes('winbox')) {
            return match;
          }
          return `src="./static/js/${p1}"`;
        }
      );
      
      // Add winbox.min.js before polyfills if not already present
      if (!htmlContent.includes('./static/js/winbox.min.js')) {
        htmlContent = htmlContent.replace(
          /(<script src="\.\/static\/js\/polyfills-[^"]+\.js")/,
          winboxScript + '$1'
        );
      }
      
      // Fix favicon path
      htmlContent = htmlContent.replace(
        /href="([^"]*favicon[^"]*)"/g,
        'href="./favicon.ico"'
      );
      
      await fs.writeFile(rootIndexHtml, htmlContent);
      logger.stepLog('Copied and fixed index.html paths');
    } else {
      // Fallback: create a minimal host page
      const htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Rust WebUI Application</title>
  <base href="./">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="./favicon.ico">
  <link rel="stylesheet" href="./static/css/winbox.min.css">
</head>
<body>
  <app-root></app-root>

  <!-- WinBox must be loaded before main.js -->
  <script src="./static/js/winbox.min.js"></script>
  <script src="./static/js/webui.js"></script>
  <script src="./static/js/main.js"></script>
</body>
</html>`;

      await fs.writeFile(rootIndexHtml, htmlContent);
      logger.stepLog('Created minimal dist/index.html');
    }
    logger.endStep(true);

    logger.success('Frontend build completed!');
    logger.printSummary();

  } catch (error) {
    logger.error(`Build failed: ${error.message}`);
    logger.printSummary();
    process.exitCode = 1;
  } finally {
    process.chdir(originalDir);
  }
}

buildFrontend();
