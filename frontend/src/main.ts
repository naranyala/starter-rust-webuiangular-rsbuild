/**
 * Angular 19 Bootstrap - AOT Mode (No JIT)
 * 
 * Rsbuild compiles Angular templates at build time (AOT)
 * So we don't need JIT compiler at runtime
 */

import 'zone.js';

import './winbox-loader';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './views/app.component';
import { provideZoneChangeDetection } from '@angular/core';
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './core/global-error.handler';

console.log('[Angular] Starting bootstrap (AOT mode)...');

// Disable any potential JIT compilation at runtime
(window as any).__Ng_Jit_Mode = false;

// Bootstrap with AOT (no compiler needed at runtime)
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
}).then(() => {
  console.log('[Angular] Bootstrap successful!');
}).catch((err) => {
  console.error('[Angular] Bootstrap failed:', err);
  // Show error in UI
  const container = document.getElementById('error-container');
  const msgEl = document.getElementById('error-message');
  const stackEl = document.getElementById('error-stack');
  if (msgEl) msgEl.textContent = err.message || String(err);
  if (stackEl && err.stack) stackEl.textContent = err.stack;
  if (container) container.classList.add('visible');
});
