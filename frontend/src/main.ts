/**
 * Angular 19 Bleeding-Edge Bootstrap
 *
 * Features:
 * - Zoneless-ready (comment out 'zone.js' import for zoneless mode)
 * - Signal-based error handling
 * - Modern ES2022 bootstrap pattern
 */

// Zone.js - Comment out this line to enable zoneless mode
// import 'zone.js';

import './winbox-loader';
import { ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { GlobalErrorHandler } from './core/global-error.handler';
import { GlobalErrorService } from './core/global-error.service';
import { environment } from './environments/environment';
import { EventBusViewModel } from './viewmodels/event-bus.viewmodel';
import {
  backend,
  clearLogHistory,
  configureLogging,
  getLogger,
  getLogHistory,
} from './viewmodels/logger';
import { AppComponent } from './views/app.component';

// Initialize global event bus
const eventBus = new EventBusViewModel<Record<string, unknown>>();
eventBus.init('app', 300);

// Configure logging
configureLogging(environment.logging);
backend.enableBackendSink();
const logger = getLogger('bootstrap');

// Expose debug APIs
const debugApiWindow = window as unknown as {
  __FRONTEND_LOGS__?: { getHistory: typeof getLogHistory; clear: typeof clearLogHistory };
  __FRONTEND_EVENT_BUS__?: EventBusViewModel<Record<string, unknown>>;
};
debugApiWindow.__FRONTEND_LOGS__ = { getHistory: getLogHistory, clear: clearLogHistory };
debugApiWindow.__FRONTEND_EVENT_BUS__ = eventBus;

const globalFlag = '__frontendGlobalErrorHooks';
const globalWindow = window as unknown as { [key: string]: unknown };

// Set up global error handlers BEFORE bootstrap
function setupGlobalErrorHandlers() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const timestamp = new Date().toISOString();
    console.error(
      `%c[${timestamp}] [UNCAUGHT ERROR]`,
      'color: #ff0000; font-weight: bold; font-size: 14px;',
      `\n┌────────────────────────────────────────────────────────────────┐
│ Uncaught Error                                                     │
├────────────────────────────────────────────────────────────────┤
│ Message: ${event.message}
│ Filename: ${event.filename}
│ Line: ${event.lineno}:${event.colno}
│ Error: ${event.error?.stack || event.error?.message || 'N/A'}
└────────────────────────────────────────────────────────────────┘`
    );
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const timestamp = new Date().toISOString();
    console.error(
      `%c[${timestamp}] [UNHANDLED REJECTION]`,
      'color: #ff6600; font-weight: bold; font-size: 14px;',
      `\n┌────────────────────────────────────────────────────────────────┐
│ Unhandled Promise Rejection                                       │
├────────────────────────────────────────────────────────────────┤
│ Reason: ${event.reason?.stack || event.reason?.message || event.reason}
└────────────────────────────────────────────────────────────────┘`
    );
  });

  // Override console.error to capture all errors
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const timestamp = new Date().toISOString();
    originalConsoleError(
      `%c[${timestamp}] [CONSOLE.ERROR]`,
      'color: #ff4444; font-weight: bold;',
      ...args
    );
  };

  // Override console.warn to capture warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const timestamp = new Date().toISOString();
    originalConsoleWarn(
      `%c[${timestamp}] [CONSOLE.WARN]`,
      'color: #ffaa00; font-weight: bold;',
      ...args
    );
  };

  globalWindow[globalFlag] = true;
  logger.info('Global error handlers installed');
}

// Bootstrap function
function bootstrap() {
  try {
    // Install global handlers FIRST
    setupGlobalErrorHandlers();

    logger.info('Starting Angular bootstrap', {
      production: environment.production,
      zoneless: !environment.production, // Use zoneless in production
    });

    bootstrapApplication(AppComponent, {
      providers: [
        // Zone change detection (remove for pure zoneless)
        provideZoneChangeDetection({
          // Coalesce multiple change detection runs
          coalesce: true,
          // Schedule change detection in macro task
          scheduleInMacroTask: false,
        }),
        // Global error handler
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
      ],
    })
      .then((appRef) => {
        // Set up global error hooks after bootstrap
        if (!globalWindow[globalFlag]) {
          window.addEventListener('error', (event) => {
            event.preventDefault();
            const errorService = appRef.injector.get(GlobalErrorService);
            errorService.report(event.error ?? event.message, { source: 'window' });
          });

          window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            const errorService = appRef.injector.get(GlobalErrorService);
            errorService.report(event.reason, {
              source: 'promise',
              title: 'Unhandled Promise Rejection',
            });
          });

          globalWindow[globalFlag] = true;
        }

        // Publish app ready event
        eventBus.publish('app:ready', { timestamp: Date.now() });
        logger.info('Angular bootstrap completed', {
          componentCount: appRef.componentCount,
        });
      })
      .catch((err) => {
        logger.error('Angular bootstrap failed', {}, err);
        document.body.innerHTML = `<h1 style="color:red;">Error: ${err.message}</h1>`;
      });
  } catch (err: unknown) {
    logger.error('Bootstrap threw synchronously', {}, err);
    document.body.innerHTML = `<h1 style="color:red;">Error: ${(err as Error).message}</h1>`;
  }
}

// Start bootstrap
bootstrap();

// Export for HMR (Hot Module Replacement)
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
  import.meta.webpackHot.dispose(() => {
    eventBus.clearAllSubscriptions();
    clearLogHistory();
  });
}
