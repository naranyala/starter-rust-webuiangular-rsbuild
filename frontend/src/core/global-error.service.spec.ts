// Frontend unit tests for GlobalErrorService
// Tests the global error handling service

import { TestBed } from '@angular/core/testing';
import { GlobalErrorService } from '../core/global-error.service';
import { ErrorCode, ErrorValue } from '../types/error.types';
import { EventBusViewModel } from '../viewmodels/event-bus.viewmodel';

describe('GlobalErrorService', () => {
  let service: GlobalErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalErrorService);
  });

  afterEach(() => {
    service.dismiss();
  });

  describe('Error Reporting', () => {
    it('should report an error', () => {
      const error: ErrorValue = {
        code: ErrorCode.InternalError,
        message: 'Test error',
      };

      const state = service.report(error);

      expect(state).toBeDefined();
      expect(state.error).toBe(error);
      expect(state.source).toBe('unknown');
    });

    it('should report error with context', () => {
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

    it('should set active error', () => {
      const error: ErrorValue = {
        code: ErrorCode.InternalError,
        message: 'Test error',
      };

      service.report(error);

      expect(service.hasError()).toBe(true);
      expect(service.activeError()).toBeDefined();
    });

    it('should generate unique error IDs', () => {
      const error1: ErrorValue = { code: ErrorCode.InternalError, message: 'Error 1' };
      const error2: ErrorValue = { code: ErrorCode.InternalError, message: 'Error 2' };

      const state1 = service.report(error1);
      const state2 = service.report(error2);

      expect(state1.id).not.toBe(state2.id);
    });

    it('should generate user-friendly message', () => {
      const error: ErrorValue = {
        code: ErrorCode.DbConnectionFailed,
        message: 'Connection refused',
      };

      const state = service.report(error);

      expect(state.userMessage).toBeDefined();
      expect(state.userMessage.length).toBeGreaterThan(0);
    });

    it('should include timestamp', () => {
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
    it('should return value for successful result', () => {
      const result = { ok: true as const, value: 'Success' };

      const value = service.handleResult(result);

      expect(value).toBe('Success');
      expect(service.hasError()).toBe(false);
    });

    it('should report error for failed result', () => {
      const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Failed' };
      const result = { ok: false as const, error };

      const value = service.handleResult(result);

      expect(value).toBeNull();
      expect(service.hasError()).toBe(true);
    });

    it('should handle Result with custom error type', () => {
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
    it('should convert Error to ErrorValue', () => {
      const error = new Error('Test error');
      const errorValue = service.fromException(error);

      expect(errorValue.code).toBe(ErrorCode.InternalError);
      expect(errorValue.message).toBe('Test error');
    });

    it('should convert string to ErrorValue', () => {
      const errorValue = service.fromException('String error');

      expect(errorValue.code).toBe(ErrorCode.Unknown);
      expect(errorValue.message).toBe('String error');
    });

    it('should convert object to ErrorValue', () => {
      const errorValue = service.fromException({ message: 'Object error' });

      expect(errorValue.message).toBe('Object error');
    });

    it('should use custom default code', () => {
      const errorValue = service.fromException('Error', ErrorCode.ValidationFailed);

      expect(errorValue.code).toBe(ErrorCode.ValidationFailed);
    });
  });

  describe('Validation Errors', () => {
    it('should create validation error', () => {
      const state = service.validationError('email', 'Invalid email format');

      expect(state.error.code).toBe(ErrorCode.ValidationFailed);
      expect(state.error.field).toBe('email');
      expect(state.error.message).toBe('Invalid email format');
    });

    it('should set validation error title', () => {
      const state = service.validationError('email', 'Invalid');

      expect(state.title).toBe('Validation Error');
    });
  });

  describe('Not Found Errors', () => {
    it('should create not found error for resource', () => {
      const state = service.notFoundError('User', '123');

      expect(state.error.code).toBe(ErrorCode.ResourceNotFound);
      expect(state.error.message).toContain('User not found: 123');
    });

    it('should set not found error title', () => {
      const state = service.notFoundError('User', '123');

      expect(state.title).toBe('Not Found');
    });
  });

  describe('Error Dismissal', () => {
    it('should dismiss active error', () => {
      service.report({ code: ErrorCode.InternalError, message: 'Error' });
      expect(service.hasError()).toBe(true);

      service.dismiss();

      expect(service.hasError()).toBe(false);
      expect(service.activeError()).toBeNull();
    });

    it('should handle dismissing when no error', () => {
      expect(() => service.dismiss()).not.toThrow();
    });
  });

  describe('Error Queries', () => {
    it('should check if error exists', () => {
      expect(service.hasError()).toBe(false);

      service.report({ code: ErrorCode.InternalError, message: 'Error' });

      expect(service.hasError()).toBe(true);
    });

    it('should get current error code', () => {
      expect(service.getCurrentErrorCode()).toBeNull();

      service.report({ code: ErrorCode.ValidationFailed, message: 'Error' });

      expect(service.getCurrentErrorCode()).toBe(ErrorCode.ValidationFailed);
    });

    it('should check specific error code', () => {
      service.report({ code: ErrorCode.InternalError, message: 'Error' });

      expect(service.isErrorCode(ErrorCode.InternalError)).toBe(true);
      expect(service.isErrorCode(ErrorCode.ValidationFailed)).toBe(false);
    });
  });

  describe('Default Titles', () => {
    it('should use Validation Error title for validation errors', () => {
      const state = service.report({ code: ErrorCode.ValidationFailed, message: 'Error' });
      expect(state.title).toBe('Validation Error');
    });

    it('should use Not Found title for not found errors', () => {
      const state = service.report({ code: ErrorCode.ResourceNotFound, message: 'Error' });
      expect(state.title).toBe('Not Found');
    });

    it('should use System Error title for internal errors', () => {
      const state = service.report({ code: ErrorCode.InternalError, message: 'Error' });
      expect(state.title).toBe('System Error');
    });

    it('should use Error title for unknown errors', () => {
      const state = service.report({ code: ErrorCode.Unknown, message: 'Error' });
      expect(state.title).toBe('Error');
    });
  });

  describe('Event Publishing', () => {
    it('should publish error event', () => {
      const eventBusSpy = spyOn(service as any, 'eventBus').and.returnValue({
        publish: jasmine.createSpy('publish'),
      });

      service.report({ code: ErrorCode.InternalError, message: 'Error' });

      expect((service as any).eventBus.publish).toHaveBeenCalledWith(
        'error:captured',
        jasmine.objectContaining({
          code: ErrorCode.InternalError,
        })
      );
    });
  });
});

describe('GlobalErrorService with EventBus', () => {
  let service: GlobalErrorService;
  let mockEventBus: EventBusViewModel<Record<string, unknown>>;

  beforeEach(() => {
    mockEventBus = new EventBusViewModel<Record<string, unknown>>();
    mockEventBus.init('test', 100);

    // Set up global event bus for the service
    (window as any).__FRONTEND_EVENT_BUS__ = mockEventBus;

    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalErrorService);
  });

  afterEach(() => {
    delete (window as any).__FRONTEND_EVENT_BUS__;
    service.dismiss();
  });

  it('should use provided event bus', () => {
    const handler = jasmine.createSpy('handler');
    mockEventBus.subscribe('error:captured', handler);

    service.report({ code: ErrorCode.InternalError, message: 'Error' });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
