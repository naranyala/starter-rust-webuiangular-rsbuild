// Bun test suite for Logger and LoggingViewModel
// Tests the structured logging implementation

import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import {
  backend,
  clearLogHistory,
  configureLogging,
  getLogger,
  getLogHistory,
  Logger,
} from './logger';
import { LoggingViewModel } from './logging.viewmodel';

describe('LoggingViewModel', () => {
  let viewModel: LoggingViewModel;

  beforeEach(() => {
    viewModel = new LoggingViewModel();
    viewModel.configure({
      enabled: true,
      minLevel: 'debug',
      maxEntries: 100,
      redactKeys: ['password', 'token'],
    });
  });

  afterEach(() => {
    viewModel.setEnabled(false);
  });

  describe('Configuration', () => {
    test('should be configurable', () => {
      viewModel.configure({
        enabled: false,
        minLevel: 'error',
        maxEntries: 50,
      });

      expect(viewModel.shouldLog('debug')).toBe(false);
      expect(viewModel.shouldLog('error')).toBe(true);
    });

    test('should enable/disable logging', () => {
      viewModel.setEnabled(false);
      expect(viewModel.shouldLog('info')).toBe(false);

      viewModel.setEnabled(true);
      expect(viewModel.shouldLog('info')).toBe(true);
    });

    test('should respect log level filtering', () => {
      viewModel.configure({ minLevel: 'warn' });

      expect(viewModel.shouldLog('debug')).toBe(false);
      expect(viewModel.shouldLog('info')).toBe(false);
      expect(viewModel.shouldLog('warn')).toBe(true);
      expect(viewModel.shouldLog('error')).toBe(true);
    });
  });

  describe('Event Emission', () => {
    test('should emit log entries', () => {
      const entry = {
        level: 'info' as const,
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

    test('should not emit when disabled', () => {
      viewModel.setEnabled(false);

      const entry = {
        level: 'info' as const,
        namespace: 'test',
        message: 'Test message',
        context: {},
        timestamp: Date.now(),
      };

      viewModel.emit(entry);

      expect(viewModel.snapshot().length).toBe(0);
    });

    test('should not emit below minimum level', () => {
      viewModel.configure({ minLevel: 'error' });

      const entry = {
        level: 'debug' as const,
        namespace: 'test',
        message: 'Debug message',
        context: {},
        timestamp: Date.now(),
      };

      viewModel.emit(entry);

      expect(viewModel.snapshot().length).toBe(0);
    });

    test('should respect max entries limit', () => {
      viewModel.configure({ maxEntries: 5 });

      for (let i = 0; i < 10; i++) {
        viewModel.emit({
          level: 'info' as const,
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
    test('should redact sensitive keys', () => {
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

    test('should handle nested objects', () => {
      viewModel.configure({ redactKeys: ['password'] });

      const sanitized = viewModel.sanitize({
        user: {
          name: 'john',
          password: 'secret',
        },
      });

      expect((sanitized.user as any).password).toBe('[REDACTED]');
    });

    test('should handle arrays', () => {
      viewModel.configure({ redactKeys: ['secret'] });

      const sanitized = viewModel.sanitize({
        items: [{ secret: 'value1' }, { public: 'value2' }],
      });

      expect((sanitized.items as any)[0].secret).toBe('[REDACTED]');
      expect((sanitized.items as any)[1].public).toBe('value2');
    });
  });

  describe('Console Sink', () => {
    let consoleSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log to console when enabled', () => {
      viewModel.enableConsoleSink();

      viewModel.emit({
        level: 'info' as const,
        namespace: 'test',
        message: 'Console message',
        context: {},
        timestamp: Date.now(),
      });

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Backend Sink', () => {
    test('should enable backend sink', () => {
      const sendSpy = jest.spyOn(viewModel as any, 'sendToBackend').mockImplementation(() => {});

      viewModel.enableBackendSink();

      viewModel.emit({
        level: 'info' as const,
        namespace: 'test',
        message: 'Backend message',
        context: {},
        timestamp: Date.now(),
      });

      expect(sendSpy).toHaveBeenCalled();
      sendSpy.mockRestore();
    });
  });
});

describe('Logger', () => {
  let logger: Logger;
  let mockBackend: LoggingViewModel;

  beforeEach(() => {
    mockBackend = {
      shouldLog: jest.fn().mockReturnValue(true),
      emit: jest.fn(),
      sanitize: jest.fn().mockImplementation((ctx) => ctx),
      enableConsoleSink: jest.fn(),
      enableBackendSink: jest.fn(),
      configure: jest.fn(),
      snapshot: jest.fn().mockReturnValue([]),
    } as unknown as LoggingViewModel;

    logger = new Logger(mockBackend, 'test');
  });

  describe('Log Levels', () => {
    test('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' });

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          message: 'Debug message',
          namespace: 'test',
        })
      );
    });

    test('should log info messages', () => {
      logger.info('Info message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Info message',
        })
      );
    });

    test('should log warn messages', () => {
      logger.warn('Warning message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          message: 'Warning message',
        })
      );
    });

    test('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', {}, error);

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Error message',
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
          }),
        })
      );
    });
  });

  describe('Context', () => {
    test('should include base context in all logs', () => {
      const contextLogger = new Logger(mockBackend, 'test', { module: 'auth' });

      contextLogger.info('Message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          context: { module: 'auth' },
        })
      );
    });

    test('should merge per-log context with base context', () => {
      const contextLogger = new Logger(mockBackend, 'test', { module: 'auth' });

      contextLogger.info('Message', { action: 'login' });

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          context: { module: 'auth', action: 'login' },
        })
      );
    });

    test('should create child logger with extended namespace', () => {
      const childLogger = logger.child('child');

      childLogger.info('Child message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: 'test.child',
        })
      );
    });

    test('should create child logger with additional context', () => {
      const childLogger = logger.child('child', { feature: 'search' });

      childLogger.info('Message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: 'test.child',
          context: { feature: 'search' },
        })
      );
    });

    test('should create logger with new context using withContext', () => {
      const contextLogger = logger.withContext({ requestId: '123' });

      contextLogger.info('Message');

      expect(mockBackend.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          context: { requestId: '123' },
        })
      );
    });
  });

  describe('Should Log Check', () => {
    test('should not log when backend says no', () => {
      (mockBackend.shouldLog as jest.Mock).mockReturnValue(false);

      logger.info('Message');

      expect(mockBackend.emit).not.toHaveBeenCalled();
    });
  });

  describe('Error Normalization', () => {
    test('should normalize Error objects', () => {
      const error = new Error('Test');
      error.stack = 'Stack trace';

      logger.error('Message', {}, error);

      const emittedError = (mockBackend.emit.mock.calls[0][0] as any).error;
      expect(emittedError.name).toBe('Error');
      expect(emittedError.message).toBe('Test');
      expect(emittedError.stack).toBe('Stack trace');
    });

    test('should normalize string errors', () => {
      logger.error('Message', {}, 'String error');

      const emittedError = (mockBackend.emit.mock.calls[0][0] as any).error;
      expect(emittedError.name).toBe('UnknownError');
      expect(emittedError.message).toBe('String error');
    });

    test('should handle null/undefined errors', () => {
      logger.error('Message', {}, null);

      const emittedError = (mockBackend.emit.mock.calls[0][0] as any).error;
      expect(emittedError).toBeUndefined();
    });
  });
});

describe('getLogger', () => {
  beforeEach(() => {
    backend.enableConsoleSink();
    backend.configure({
      enabled: true,
      minLevel: 'debug',
      maxEntries: 100,
    });
  });

  afterEach(() => {
    clearLogHistory();
  });

  test('should create logger with scope', () => {
    const logger = getLogger('myComponent');
    expect(logger).toBeDefined();
  });

  test('should create logger with context', () => {
    const logger = getLogger('myComponent', { feature: 'test' });
    expect(logger).toBeDefined();
  });

  test('should return root logger when no scope provided', () => {
    const logger = getLogger();
    expect(logger).toBeDefined();
  });
});

describe('Log History', () => {
  beforeEach(() => {
    backend.enableConsoleSink();
    backend.configure({
      enabled: true,
      minLevel: 'debug',
      maxEntries: 100,
    });
  });

  afterEach(() => {
    clearLogHistory();
  });

  test('should get log history', () => {
    const logger = getLogger('test');
    logger.info('Test message');

    const history = getLogHistory();

    expect(history.length).toBeGreaterThan(0);
    expect(history.some((e) => e.message === 'Test message')).toBe(true);
  });

  test('should clear log history', () => {
    const logger = getLogger('test');
    logger.info('Message 1');
    logger.info('Message 2');

    expect(getLogHistory().length).toBeGreaterThan(0);

    clearLogHistory();

    expect(getLogHistory().length).toBe(0);
  });
});

describe('configureLogging', () => {
  test('should configure logging options', () => {
    const logger = configureLogging({
      enabled: true,
      minLevel: 'info',
      maxEntries: 50,
    });

    expect(logger).toBeDefined();
  });
});
