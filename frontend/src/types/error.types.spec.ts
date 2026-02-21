// Frontend unit tests for error handling types
// Tests the "errors as values" pattern implementation

import { TestBed } from '@angular/core/testing';
import {
  ApiResponse,
  andThen,
  ErrorCode,
  ErrorResponse,
  ErrorValue,
  err,
  internalError,
  isErr,
  isError,
  isOk,
  isSuccess,
  logError,
  mapError,
  mapResult,
  notFoundError,
  ok,
  Result,
  SuccessResponse,
  toResult,
  toUserMessage,
  unwrap,
  unwrapError,
  unwrapOr,
  validationError,
} from './error.types';

describe('ErrorCode', () => {
  it('should have database error codes', () => {
    expect(ErrorCode.DbConnectionFailed).toBe('DB_CONNECTION_FAILED');
    expect(ErrorCode.DbQueryFailed).toBe('DB_QUERY_FAILED');
    expect(ErrorCode.DbNotFound).toBe('DB_NOT_FOUND');
  });

  it('should have validation error codes', () => {
    expect(ErrorCode.ValidationFailed).toBe('VALIDATION_FAILED');
    expect(ErrorCode.MissingRequiredField).toBe('MISSING_REQUIRED_FIELD');
  });

  it('should have not found error codes', () => {
    expect(ErrorCode.ResourceNotFound).toBe('RESOURCE_NOT_FOUND');
    expect(ErrorCode.UserNotFound).toBe('USER_NOT_FOUND');
  });
});

describe('ErrorValue', () => {
  it('should create basic error value', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbNotFound,
      message: 'User not found',
    };

    expect(error.code).toBe(ErrorCode.DbNotFound);
    expect(error.message).toBe('User not found');
  });

  it('should create error with details', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbQueryFailed,
      message: 'Query failed',
      details: 'SQL syntax error',
      field: 'query',
    };

    expect(error.details).toBe('SQL syntax error');
    expect(error.field).toBe('query');
  });

  it('should create error with context', () => {
    const error: ErrorValue = {
      code: ErrorCode.ResourceNotFound,
      message: 'Not found',
      context: { resource: 'user', id: '123' },
    };

    expect(error.context).toEqual({ resource: 'user', id: '123' });
  });
});

describe('Type Guards', () => {
  it('should identify error responses', () => {
    const errorResponse: ErrorResponse = {
      success: false,
      data: null,
      error: { code: ErrorCode.InternalError, message: 'Error' },
    };

    expect(isError(errorResponse)).toBe(true);
    expect(isSuccess(errorResponse)).toBe(false);
  });

  it('should identify success responses', () => {
    const successResponse: SuccessResponse<string> = {
      success: true,
      data: 'Success',
      error: null,
    };

    expect(isSuccess(successResponse)).toBe(true);
    expect(isError(successResponse)).toBe(false);
  });
});

describe('Result Type', () => {
  it('should create success result', () => {
    const result: Result<number> = ok(42);

    expect(result.ok).toBe(true);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('should create error result', () => {
    const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Failed' };
    const result: Result<number> = err(error);

    expect(result.ok).toBe(false);
    expect(isErr(result)).toBe(true);
    expect(isOk(result)).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Failed');
    }
  });

  it('should convert API response to Result', () => {
    const successResponse: ApiResponse<string> = {
      success: true,
      data: 'Data',
      error: null,
    };
    const successResult = toResult(successResponse);
    expect(successResult.ok).toBe(true);

    const errorResponse: ApiResponse<string> = {
      success: false,
      data: null,
      error: { code: ErrorCode.InternalError, message: 'Error' },
    };
    const errorResult = toResult(errorResponse);
    expect(errorResult.ok).toBe(false);
  });
});

describe('Result Operations', () => {
  it('should map success value', () => {
    const result: Result<number> = ok(42);
    const mapped = mapResult(result, (n) => n * 2);

    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(84);
    }
  });

  it('should preserve error in map', () => {
    const result: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    const mapped = mapResult(result, (n) => n * 2);

    expect(mapped.ok).toBe(false);
  });

  it('should map error value', () => {
    const result: Result<number, string> = err('Original error');
    const mapped = mapError(result, (e) => `Mapped: ${e}`);

    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe('Mapped: Original error');
    }
  });

  it('should chain operations with andThen', () => {
    const result: Result<number> = ok(42);
    const chained = andThen(result, (n) => ok(n + 10));

    expect(chained.ok).toBe(true);
    if (chained.ok) {
      expect(chained.value).toBe(52);
    }
  });

  it('should preserve error in chain', () => {
    const result: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    const chained = andThen(result, (n) => ok(n + 10));

    expect(chained.ok).toBe(false);
  });

  it('should unwrap or default', () => {
    const success: Result<number> = ok(42);
    expect(unwrapOr(success, 0)).toBe(42);

    const failure: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    expect(unwrapOr(failure, 0)).toBe(0);
  });

  it('should unwrap error', () => {
    const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Error' };
    const result: Result<number> = err(error);

    const unwrapped = unwrapError(result);
    expect(unwrapped).toEqual(error);

    const success: Result<number> = ok(42);
    expect(unwrapError(success)).toBeNull();
  });
});

describe('Error Helpers', () => {
  it('should create validation error', () => {
    const error = validationError('email', 'Invalid email format');

    expect(error.code).toBe(ErrorCode.ValidationFailed);
    expect(error.field).toBe('email');
    expect(error.message).toBe('Invalid email format');
  });

  it('should create not found error', () => {
    const error = notFoundError('User', 123);

    expect(error.code).toBe(ErrorCode.ResourceNotFound);
    expect(error.message).toContain('User not found: 123');
    expect(error.context).toEqual({ resource: 'User', id: '123' });
  });

  it('should create internal error', () => {
    const error = internalError('Something went wrong', 'Cause');

    expect(error.code).toBe(ErrorCode.InternalError);
    expect(error.message).toBe('Something went wrong');
    expect(error.cause).toBe('Cause');
  });
});

describe('toUserMessage', () => {
  it('should show field-specific message for validation errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.ValidationFailed,
      message: 'Invalid format',
      field: 'email',
    };

    expect(toUserMessage(error)).toBe('email: Invalid format');
  });

  it('should show helpful message for not found errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.ResourceNotFound,
      message: 'User not found',
    };

    expect(toUserMessage(error)).toBe('User not found');
  });

  it('should show helpful message for database errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbConnectionFailed,
      message: 'Connection refused',
    };

    expect(toUserMessage(error)).toContain('database');
  });

  it('should show generic message for unknown errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.Unknown,
      message: '',
    };

    expect(toUserMessage(error)).toContain('error occurred');
  });

  it('should handle duplicate constraint errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbQueryFailed,
      message: 'duplicate key value',
    };

    expect(toUserMessage(error)).toContain('already exists');
  });
});

describe('logError', () => {
  it('should log error to console', () => {
    const consoleSpy = spyOn(console, 'error');
    const error: ErrorValue = {
      code: ErrorCode.InternalError,
      message: 'Test error',
    };

    logError(error, 'TestContext');

    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.calls.mostRecent().args[0];
    expect(callArgs).toContain('[TestContext]');
    expect(callArgs).toContain('INTERNAL_ERROR');
  });
});

describe('unwrap', () => {
  it('should return value for success', () => {
    const result: Result<number> = ok(42);
    expect(unwrap(result)).toBe(42);
  });

  it('should throw for error', () => {
    const result: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    expect(() => unwrap(result)).toThrow();
  });
});
