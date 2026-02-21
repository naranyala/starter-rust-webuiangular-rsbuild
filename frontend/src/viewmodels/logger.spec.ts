// Frontend unit tests for Logger and LoggingViewModel
// Tests the structured logging implementation

import { LogEntry, LogLevel } from '../models';
import {
  backend,
  clearLogHistory,
  configureLogging,
  getLogger,
  getLogHistory,
  Logger,
  rootLogger,
} from './logger';
import { LoggingViewModel } from './logging.viewmodel';

describe('LoggingViewModel', () => {
  let viewModel: LoggingViewModel;

  beforeEach(() => {
    viewModel = new LoggingViewModel();
    viewModel.configure({
      enabled: true,
      minLevel: 'debug' as LogLevel,
      maxEntries: 100,
      redactKeys: ['password', 'token'],
    });
  });

  describe('Configuration', () => {
    it('should be configurable', () => {
      viewModel.configure({
        enabled: false,
        minLevel: 'error' as LogLevel,
        maxEntries: 50,
      });

      expect(viewModel.shouldLog('debug')).toBe(false);
      expect(viewModel.shouldLog('error')).toBe(true);
    });

    it('should enable/disable logging', () => {
      viewModel.setEnabled(false);
      expect(viewModel.shouldLog('info')).toBe(false);

      viewModel.setEnabled(true);
      expect(viewModel.shouldLog('info')).toBe(true);
    });

    it('should respect log level filtering', () => {
      viewModel.configure({ minLevel: 'warn' as LogLevel });

      expect(viewModel.shouldLog('debug')).toBe(false);
      expect(viewModel.shouldLog('info')).toBe(false);
      expect(viewModel.shouldLog('warn')).toBe(true);
      expect(viewModel.shouldLog('error')).toBe(true);
    });
  });

  describe('Event Emission', () => {
    it('should emit log entries', () => {
      const entry: LogEntry = {
        level: 'info',
        namespace: 'test',
        message: 'Test message',
        context: {},
        timestamp: Date.now(),
      };

      viewModel.emit(entry);

      const history = viewModel.snapshot();
      expect(history.length).toBe(1);
      expect(history[0].message).toBe('Test message');
    });

    it('should not emit when disabled', () => {
      viewModel.setEnabled(false);

      const entry: LogEntry = {
        level: 'info',
        namespace: 'test',
        message: 'Test message',
        context: {},
        timestamp: Date.now(),
      };

      viewModel.emit(entry);

      expect(viewModel.snapshot().length).toBe(0);
    });

    it('should not emit below minimum level', () => {
      viewModel.configure({ minLevel: 'error' as LogLevel });

      const entry: LogEntry = {
        level: 'debug',
        namespace: 'test',
        message: 'Debug message',
        context: {},
        timestamp: Date.now(),
      };

      viewModel.emit(entry);

      expect(viewModel.snapshot().length).toBe(0);
    });

    it('should respect max entries limit', () => {
      viewModel.configure({ maxEntries: 5 });

      for (let i = 0; i < 10; i++) {
        viewModel.emit({
          level: 'info',
          namespace: 'test',
          message: `Message ${i}`,
          context: {},
          timestamp: Date.now(),
        });
      }

      const history = viewModel.snapshot();
      expect(history.length).toBe(5);
      expect(history[0].message).toBe('Message 5');
    });
  });

  describe('Sanitization', () => {
    it('should redact sensitive keys', () => {
      viewModel.configure({ redactKeys: ['password', 'token'] });

      const sanitized = viewModel.sanitize({
        username: 'john',
        password: 'secret123',
        token: 'abc123',
        data: 'public',
      });

      expect(sanitized.username).toBe('john');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.data).toBe('public');
    });

    it('should handle nested objects', () => {
      viewModel.configure({ redactKeys: ['password'] });

      const sanitized = viewModel.sanitize({
        user: {
          name: 'john',
          password: 'secret',
        },
      });

      expect(sanitized.user.password).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      viewModel.configure({ redactKeys: ['secret'] });

      const sanitized = viewModel.sanitize({
        items: [{ secret: 'value1' }, { public: 'value2' }],
      });

      expect(sanitized.items[0].secret).toBe('[REDACTED]');
      expect(sanitized.items[1].public).toBe('value2');
    });
  });

  describe('Console Sink', () => {
    it('should log to console when enabled', () => {
      const consoleSpy = spyOn(console, 'log');
      viewModel.enableConsoleSink();

      viewModel.emit({
        level: 'info',
        namespace: 'test',
        message: 'Console message',
        context: {},
        timestamp: Date.now(),
      });

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Backend Sink', () => {
    it('should enable backend sink', () => {
      spyOn(viewModel as any, 'sendToBackend');

      viewModel.enableBackendSink();

      viewModel.emit({
        level: 'info',
        namespace: 'test',
        message: 'Backend message',
        context: {},
        timestamp: Date.now(),
      });

      expect((viewModel as any).sendToBackend).toHaveBeenCalled();
    });
  });
});

describe('Logger', () => {
  let logger: Logger;
  let mockBackend: jasmine.SpyObj<LoggingViewModel>;

  beforeEach(() => {
    mockBackend = jasmine.createSpyObj('LoggingViewModel', [
      'shouldLog',
      'emit',
      'sanitize',
      'enableConsoleSink',
    ]);
    mockBackend.shouldLog.and.returnValue(true);
    mockBackend.sanitize.and.callFake((ctx) => ctx);

    logger = new Logger(mockBackend, 'test');
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' });

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          level: 'debug',
          message: 'Debug message',
          namespace: 'test',
        })
      );
    });

    it('should log info messages', () => {
      logger.info('Info message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          level: 'info',
          message: 'Info message',
        })
      );
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          level: 'warn',
          message: 'Warning message',
        })
      );
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', {}, error);

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          level: 'error',
          message: 'Error message',
          error: jasmine.objectContaining({
            name: 'Error',
            message: 'Test error',
          }),
        })
      );
    });
  });

  describe('Context', () => {
    it('should include base context in all logs', () => {
      const contextLogger = new Logger(mockBackend, 'test', { module: 'auth' });

      contextLogger.info('Message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          context: { module: 'auth' },
        })
      );
    });

    it('should merge per-log context with base context', () => {
      const contextLogger = new Logger(mockBackend, 'test', { module: 'auth' });

      contextLogger.info('Message', { action: 'login' });

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          context: { module: 'auth', action: 'login' },
        })
      );
    });

    it('should create child logger with extended namespace', () => {
      const childLogger = logger.child('child');

      childLogger.info('Child message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          namespace: 'test.child',
        })
      );
    });

    it('should create child logger with additional context', () => {
      const childLogger = logger.child('child', { feature: 'search' });

      childLogger.info('Message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          namespace: 'test.child',
          context: { feature: 'search' },
        })
      );
    });

    it('should create logger with new context using withContext', () => {
      const contextLogger = logger.withContext({ requestId: '123' });

      contextLogger.info('Message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          context: { requestId: '123' },
        })
      );
    });
  });

  describe('Should Log Check', () => {
    it('should not log when backend says no', () => {
      mockBackend.shouldLog.and.returnValue(false);

      logger.info('Message');

      expect(mockBackend.emit).not.toHaveBeenCalled();
    });
  });

  describe('Error Normalization', () => {
    it('should normalize Error objects', () => {
      const error = new Error('Test');
      error.stack = 'Stack trace';

      logger.error('Message', {}, error);

      const emittedError = (mockBackend.emit.calls.mostRecent().args[0] as LogEntry).error;
      expect(emittedError?.name).toBe('Error');
      expect(emittedError?.message).toBe('Test');
      expect(emittedError?.stack).toBe('Stack trace');
    });

    it('should normalize string errors', () => {
      logger.error('Message', {}, 'String error');

      const emittedError = (mockBackend.emit.calls.mostRecent().args[0] as LogEntry).error;
      expect(emittedError?.name).toBe('UnknownError');
      expect(emittedError?.message).toBe('String error');
    });

    it('should handle null/undefined errors', () => {
      logger.error('Message', {}, null);

      const emittedError = (mockBackend.emit.calls.mostRecent().args[0] as LogEntry).error;
      expect(emittedError).toBeUndefined();
    });
  });
});

describe('getLogger', () => {
  beforeEach(() => {
    backend.enableConsoleSink();
    backend.configure({
      enabled: true,
      minLevel: 'debug' as LogLevel,
      maxEntries: 100,
    });
  });

  afterEach(() => {
    clearLogHistory();
  });

  it('should create logger with scope', () => {
    const logger = getLogger('myComponent');
    expect(logger).toBeDefined();
  });

  it('should create logger with context', () => {
    const logger = getLogger('myComponent', { feature: 'test' });
    expect(logger).toBeDefined();
  });

  it('should return root logger when no scope provided', () => {
    const logger = getLogger();
    expect(logger).toBeDefined();
  });
});

describe('Log History', () => {
  beforeEach(() => {
    backend.enableConsoleSink();
    backend.configure({
      enabled: true,
      minLevel: 'debug' as LogLevel,
      maxEntries: 100,
    });
  });

  afterEach(() => {
    clearLogHistory();
  });

  it('should get log history', () => {
    const logger = getLogger('test');
    logger.info('Test message');

    const history = getLogHistory();

    expect(history.length).toBeGreaterThan(0);
    expect(history.some((e) => e.message === 'Test message')).toBe(true);
  });

  it('should clear log history', () => {
    const logger = getLogger('test');
    logger.info('Message 1');
    logger.info('Message 2');

    expect(getLogHistory().length).toBeGreaterThan(0);

    clearLogHistory();

    expect(getLogHistory().length).toBe(0);
  });
});

describe('configureLogging', () => {
  it('should configure logging options', () => {
    const logger = configureLogging({
      enabled: true,
      minLevel: 'info' as LogLevel,
      maxEntries: 50,
    });

    expect(logger).toBeDefined();
  });
});
