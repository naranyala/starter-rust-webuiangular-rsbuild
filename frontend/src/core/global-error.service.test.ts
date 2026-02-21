// Bun test suite for GlobalErrorService
// Tests the global error handling service

import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import { ErrorCode, ErrorValue } from '../types/error.types';
import { GlobalErrorService } from './global-error.service';

// Mock window object for Bun environment
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  CustomEvent: class CustomEvent {
    type: string;
    detail?: unknown;
    constructor(type: string, options?: { detail?: unknown }) {
      this.type = type;
      this.detail = options?.detail;
    }
  },
};

// Mock EventBusViewModel for testing
class MockEventBus {
  private handlers = new Map<string, Set<Function>>();

  publish(event: string, payload: unknown) {
    const handlers = this.handlers.get(event);
    handlers?.forEach((h) => h(payload));
  }

  subscribe(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }
}

describe('GlobalErrorService', () => {
  let service: GlobalErrorService;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();

    // Set up global window mock
    (global as any).window = mockWindow;
    (global as any).window.__FRONTEND_EVENT_BUS__ = mockEventBus;

    service = new GlobalErrorService();
  });

  afterEach(() => {
    service.dismiss();
    delete (global as any).window;
  });

  describe('Error Reporting', () => {
    test('should report an error', () => {
      const error: ErrorValue = {
        code: ErrorCode.InternalError,
        message: 'Test error',
      };

      const state = service.report(error);

      expect(state).toBeDefined();
      expect(state.error).toBe(error);
      expect(state.source).toBe('unknown');
    });

    test('should report error with context', () => {
      const error: ErrorValue = {
        code: ErrorCode.ValidationFailed,
        message: 'Invalid input',
      };

      const state = service.report(error, {
        source: 'form',
        title: 'Form Error',
      });

      expect(state.source).toBe('form');
      expect(state.title).toBe('Form Error');
    });

    test('should set active error', () => {
      const error: ErrorValue = {
        code: ErrorCode.InternalError,
        message: 'Test error',
      };

      service.report(error);

      expect(service.hasError()).toBe(true);
      expect(service.activeError()).toBeDefined();
    });

    test('should generate unique error IDs', () => {
      const error1: ErrorValue = { code: ErrorCode.InternalError, message: 'Error 1' };
      const error2: ErrorValue = { code: ErrorCode.InternalError, message: 'Error 2' };

      const state1 = service.report(error1);
      const state2 = service.report(error2);

      expect(state1.id).not.toBe(state2.id);
    });

    test('should generate user-friendly message', () => {
      const error: ErrorValue = {
        code: ErrorCode.DbConnectionFailed,
        message: 'Connection refused',
      };

      const state = service.report(error);

      expect(state.userMessage).toBeDefined();
      expect(state.userMessage.length).toBeGreaterThan(0);
    });

    test('should include timestamp', () => {
      const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Error' };
      const before = Date.now();

      const state = service.report(error);

      const after = Date.now();
      const timestamp = new Date(state.timestamp).getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Result Handling', () => {
    test('should return value for successful result', () => {
      const result = { ok: true as const, value: 'Success' };

      const value = service.handleResult(result);

      expect(value).toBe('Success');
      expect(service.hasError()).toBe(false);
    });

    test('should report error for failed result', () => {
      const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Failed' };
      const result = { ok: false as const, error };

      const value = service.handleResult(result);

      expect(value).toBeNull();
      expect(service.hasError()).toBe(true);
    });

    test('should handle Result with custom error type', () => {
      const result = { ok: false as const, error: 'String error' };
      const onError = (e: string) => ({
        code: ErrorCode.InternalError,
        message: e,
      });

      service.handleResultWith(result, onError);

      expect(service.hasError()).toBe(true);
      expect(service.activeError()?.error.message).toBe('String error');
    });
  });

  describe('Exception Handling', () => {
    test('should convert Error to ErrorValue', () => {
      const error = new Error('Test error');
      const errorValue = service.fromException(error);

      expect(errorValue.code).toBe(ErrorCode.InternalError);
      expect(errorValue.message).toBe('Test error');
    });

    test('should convert string to ErrorValue', () => {
      const errorValue = service.fromException('String error');

      expect(errorValue.code).toBe(ErrorCode.Unknown);
      expect(errorValue.message).toBe('String error');
    });

    test('should convert object to ErrorValue', () => {
      const errorValue = service.fromException({ message: 'Object error' });

      expect(errorValue.message).toBe('Object error');
    });

    test('should use custom default code', () => {
      const errorValue = service.fromException('Error', ErrorCode.ValidationFailed);

      expect(errorValue.code).toBe(ErrorCode.ValidationFailed);
    });
  });

  describe('Validation Errors', () => {
    test('should create validation error', () => {
      const state = service.validationError('email', 'Invalid email format');

      expect(state.error.code).toBe(ErrorCode.ValidationFailed);
      expect(state.error.field).toBe('email');
      expect(state.error.message).toBe('Invalid email format');
    });

    test('should set validation error title', () => {
      const state = service.validationError('email', 'Invalid');

      expect(state.title).toBe('Validation Error');
    });
  });

  describe('Not Found Errors', () => {
    test('should create not found error for resource', () => {
      const state = service.notFoundError('User', '123');

      expect(state.error.code).toBe(ErrorCode.ResourceNotFound);
      expect(state.error.message).toContain('User not found: 123');
    });

    test('should set not found error title', () => {
      const state = service.notFoundError('User', '123');

      expect(state.title).toBe('Not Found');
    });
  });

  describe('Error Dismissal', () => {
    test('should dismiss active error', () => {
      service.report({ code: ErrorCode.InternalError, message: 'Error' });
      expect(service.hasError()).toBe(true);

      service.dismiss();

      expect(service.hasError()).toBe(false);
      expect(service.activeError()).toBeNull();
    });

    test('should handle dismissing when no error', () => {
      expect(() => service.dismiss()).not.toThrow();
    });
  });

  describe('Error Queries', () => {
    test('should check if error exists', () => {
      expect(service.hasError()).toBe(false);

      service.report({ code: ErrorCode.InternalError, message: 'Error' });

      expect(service.hasError()).toBe(true);
    });

    test('should get current error code', () => {
      expect(service.getCurrentErrorCode()).toBeNull();

      service.report({ code: ErrorCode.ValidationFailed, message: 'Error' });

      expect(service.getCurrentErrorCode()).toBe(ErrorCode.ValidationFailed);
    });

    test('should check specific error code', () => {
      service.report({ code: ErrorCode.InternalError, message: 'Error' });

      expect(service.isErrorCode(ErrorCode.InternalError)).toBe(true);
      expect(service.isErrorCode(ErrorCode.ValidationFailed)).toBe(false);
    });
  });

  describe('Default Titles', () => {
    test('should use Validation Error title for validation errors', () => {
      const state = service.report({ code: ErrorCode.ValidationFailed, message: 'Error' });
      expect(state.title).toBe('Validation Error');
    });

    test('should use Not Found title for not found errors', () => {
      const state = service.report({ code: ErrorCode.ResourceNotFound, message: 'Error' });
      expect(state.title).toBe('Not Found');
    });

    test('should use System Error title for internal errors', () => {
      const state = service.report({ code: ErrorCode.InternalError, message: 'Error' });
      expect(state.title).toBe('System Error');
    });

    test('should use Error title for unknown errors', () => {
      const state = service.report({ code: ErrorCode.Unknown, message: 'Error' });
      expect(state.title).toBe('Error');
    });
  });

  describe('Event Publishing', () => {
    test('should publish error event', () => {
      const handler = jest.fn();
      mockEventBus.subscribe('error:captured', handler);

      service.report({ code: ErrorCode.InternalError, message: 'Error' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCode.InternalError,
        })
      );
    });
  });
});

describe('GlobalErrorService with EventBus', () => {
  let service: GlobalErrorService;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockEventBus = new MockEventBus();
    (window as any).__FRONTEND_EVENT_BUS__ = mockEventBus;
    service = new GlobalErrorService();
  });

  afterEach(() => {
    delete (window as any).__FRONTEND_EVENT_BUS__;
    service.dismiss();
  });

  test('should use provided event bus', () => {
    const handler = jest.fn();
    mockEventBus.subscribe('error:captured', handler);

    service.report({ code: ErrorCode.InternalError, message: 'Error' });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
