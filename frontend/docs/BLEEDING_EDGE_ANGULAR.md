# Bleeding-Edge Angular 19 Migration Guide

## Current State Analysis ✅

Your project is already on **Angular 19.2** with:
- ✅ Standalone components
- ✅ Signals (`signal`, `computed`)
- ✅ `inject()` for DI
- ✅ Rsbuild bundler

## Bleeding-Edge Features to Adopt

### 1. Zoneless Change Detection 🚀

**Benefit**: 40-60% faster change detection, smaller bundle

**Current**: Uses `zone.js` for change detection
**Target**: Use `zoneless` provider or signals-based detection

```typescript
// src/main.ts - BEFORE
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent);

// src/main.ts - AFTER (Option A: Zoneless provider)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneless } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [provideZoneless()]
});

// src/main.ts - AFTER (Option B: Remove zone.js entirely)
// Remove 'zone.js' from polyfills.ts
// Update angular.json to exclude zone.js
```

**Package changes**:
```json
{
  "dependencies": {
    "zone.js": "~0.15.1"  // Optional - can remove for zoneless
  }
}
```

### 2. New Control Flow Syntax 🎯

**Benefit**: Better performance, simpler templates, no CommonModule needed

**Current**:
```html
<!-- app.component.html -->
<div *ngIf="!topCollapsed()">
  <div *ngFor="let card of filteredCards(); trackBy: trackByFn">
    <app-card [card]="card"></app-card>
  </div>
</div>
```

**Target**:
```html
<!-- app.component.html -->
@if (!topCollapsed()) {
  @for (card of filteredCards(); track card.id) {
    <app-card [card]="card" />
  }
}
```

**Files to update**:
- `src/views/app.component.html`
- `src/views/home/*.component.html`
- `src/views/demo/*.component.html`
- `src/views/shared/error-modal.component.html`

### 3. Signal-Based Input/Output APIs 📡

**Benefit**: Type-safe, reactive inputs/outputs

**Current**:
```typescript
@Component({...})
export class ErrorModalComponent {
  @Input() error: ErrorValue | null = null;
  @Output() closed = new EventEmitter<void>();
  
  onClose() {
    this.closed.emit();
  }
}
```

**Target**:
```typescript
import { Component, input, output, signal } from '@angular/core';

@Component({...})
export class ErrorModalComponent {
  readonly error = input<ErrorValue | null>(null);
  readonly closed = output<void>();
  
  private readonly _error = signal<ErrorValue | null>(null);
  
  onClose() {
    this.closed.emit();
  }
}
```

### 4. Deferrable Views for Lazy Loading ⏱️

**Benefit**: Load components only when needed, faster initial load

**Current**: All components loaded upfront
**Target**: Use `@defer` for below-fold content

```html
<!-- Defer loading of heavy components -->
@defer (on viewport) {
  <app-logging-panel />
} @placeholder {
  <div>Loading...</div>
} @loading {
  <div>Loading panel...</div>
} @error {
  <div>Failed to load</div>
}

<!-- Defer with interaction trigger -->
@defer (on interaction) {
  <app-demo-panel />
} @placeholder {
  <button>Show Demo</button>
}
```

### 5. HttpClient with Fetch Backend 🌐

**Benefit**: Smaller bundle, modern API

```typescript
// app.config.ts
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch())
  ]
};
```

### 6. Esbuild Application Builder 🔨

**Benefit**: 2-4x faster builds than Webpack

```json
// angular.json
{
  "architect": {
    "build": {
      "builder": "@angular/build:application",
      "options": {
        "outputPath": "dist",
        "index": "src/index.html",
        "browser": "src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "tsconfig.app.json",
        "styles": ["src/styles.css"],
        "optimization": true,
        "sourceMap": false
      }
    }
  }
}
```

### 7. Rsbuild Optimizations for Angular 19 ⚡

```typescript
// rsbuild.config.ts - UPDATED
import { defineConfig } from '@rsbuild/core';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  source: {
    entry: { main: './src/main.ts' },
    define: {
      // Angular 19 optimizations
      'ngDevMode': 'false',
      'ngJitMode': 'false',
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json'],
    alias: {
      '@': './src',
      '@models': './src/models',
      '@viewmodels': './src/viewmodels',
      '@views': './src/views',
      '@core': './src/core',
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
    dataUriLimit: { image: 4096, media: 4096 },
    copy: [
      { from: './src/favicon.ico' },
      { from: './src/assets', to: 'assets' },
    ],
    // Enable CSS extraction
    legalComments: 'none',
  },
  tools: {
    rspack: {
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            angular: {
              test: /[\\/]node_modules[\\/]@angular[\\/]/,
              name: 'angular',
              chunks: 'all',
              priority: 20,
            },
          },
        },
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      },
      experiments: {
        rspackFuture: {
          bundlerInfo: { force: false },
        },
      },
    },
  },
  html: {
    template: './src/index.html',
    scriptLoading: 'module',  // Use module loading
    inject: 'body',
  },
  server: {
    port: 4200,
    historyApiFallback: true,
    hmr: true,
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
    removeConsole: true,  // Remove console in production
    removeMomentLocale: true,
  },
  plugins: [pluginSass()],
});
```

### 8. Experimental Features 🔬

```typescript
// tsconfig.json
{
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true,
    "strictStandalone": true,  // Enforce standalone
    "enableSignalInput": true,  // Enable signal inputs
    "optimizeFor": "size"  // Optimize for bundle size
  }
}
```

## Migration Priority

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Zoneless | Medium | High | 🔴 High |
| Control Flow | Low | Medium | 🟡 Medium |
| Signal Inputs | Low | Medium | 🟡 Medium |
| Deferrable Views | Low | High | 🔴 High |
| Rsbuild Optimizations | Medium | High | 🔴 High |
| HttpClient Fetch | Low | Low | 🟢 Low |

## Quick Wins (Do First)

1. **New control flow** - 30 min, immediate template improvements
2. **Deferrable views** - 1 hour, significant load time improvement
3. **Rsbuild optimizations** - 1 hour, 30-50% bundle reduction

## Full Migration (1-2 days)

1. Zoneless change detection
2. Signal-based inputs/outputs
3. Complete Rsbuild configuration
4. Remove legacy patterns

## Testing After Migration

```bash
# Verify build
cd frontend
bun run build:rsbuild

# Run tests
bun test

# Check bundle size
ls -lh dist/static/js/

# Performance audit
lighthouse http://localhost:4200
```
