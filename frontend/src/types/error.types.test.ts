// Bun test suite for error handling types
// Tests the "errors as values" pattern implementation

import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import {
  andThen,
  ErrorCode,
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
  toResult,
  toUserMessage,
  unwrap,
  unwrapError,
  unwrapOr,
  validationError,
} from './error.types';

describe('ErrorCode', () => {
  test('should have database error codes', () => {
    expect(ErrorCode.DbConnectionFailed).toBe('DB_CONNECTION_FAILED');
    expect(ErrorCode.DbQueryFailed).toBe('DB_QUERY_FAILED');
    expect(ErrorCode.DbNotFound).toBe('DB_NOT_FOUND');
  });

  test('should have validation error codes', () => {
    expect(ErrorCode.ValidationFailed).toBe('VALIDATION_FAILED');
    expect(ErrorCode.MissingRequiredField).toBe('MISSING_REQUIRED_FIELD');
  });

  test('should have not found error codes', () => {
    expect(ErrorCode.ResourceNotFound).toBe('RESOURCE_NOT_FOUND');
    expect(ErrorCode.UserNotFound).toBe('USER_NOT_FOUND');
  });
});

describe('ErrorValue', () => {
  test('should create basic error value', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbNotFound,
      message: 'User not found',
    };

    expect(error.code).toBe(ErrorCode.DbNotFound);
    expect(error.message).toBe('User not found');
  });

  test('should create error with details', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbQueryFailed,
      message: 'Query failed',
      details: 'SQL syntax error',
      field: 'query',
    };

    expect(error.details).toBe('SQL syntax error');
    expect(error.field).toBe('query');
  });

  test('should create error with context', () => {
    const error: ErrorValue = {
      code: ErrorCode.ResourceNotFound,
      message: 'Not found',
      context: { resource: 'user', id: '123' },
    };

    expect(error.context).toEqual({ resource: 'user', id: '123' });
  });
});

describe('Type Guards', () => {
  test('should identify error responses', () => {
    const errorResponse = {
      success: false,
      data: null,
      error: { code: ErrorCode.InternalError, message: 'Error' },
    };

    expect(isError(errorResponse)).toBe(true);
    expect(isSuccess(errorResponse)).toBe(false);
  });

  test('should identify success responses', () => {
    const successResponse = {
      success: true,
      data: 'Success',
      error: null,
    };

    expect(isSuccess(successResponse)).toBe(true);
    expect(isError(successResponse)).toBe(false);
  });
});

describe('Result Type', () => {
  test('should create success result', () => {
    const result: Result<number> = ok(42);

    expect(result.ok).toBe(true);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  test('should create error result', () => {
    const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Failed' };
    const result: Result<number> = err(error);

    expect(result.ok).toBe(false);
    expect(isErr(result)).toBe(true);
    expect(isOk(result)).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Failed');
    }
  });

  test('should convert API response to Result', () => {
    const successResponse = {
      success: true,
      data: 'Data',
      error: null,
    };
    const successResult = toResult(successResponse);
    expect(successResult.ok).toBe(true);

    const errorResponse = {
      success: false,
      data: null,
      error: { code: ErrorCode.InternalError, message: 'Error' },
    };
    const errorResult = toResult(errorResponse);
    expect(errorResult.ok).toBe(false);
  });
});

describe('Result Operations', () => {
  test('should map success value', () => {
    const result: Result<number> = ok(42);
    const mapped = mapResult(result, (n) => n * 2);

    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(84);
    }
  });

  test('should preserve error in map', () => {
    const result: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    const mapped = mapResult(result, (n) => n * 2);

    expect(mapped.ok).toBe(false);
  });

  test('should map error value', () => {
    const result: Result<number, string> = err('Original error');
    const mapped = mapError(result, (e) => `Mapped: ${e}`);

    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe('Mapped: Original error');
    }
  });

  test('should chain operations with andThen', () => {
    const result: Result<number> = ok(42);
    const chained = andThen(result, (n) => ok(n + 10));

    expect(chained.ok).toBe(true);
    if (chained.ok) {
      expect(chained.value).toBe(52);
    }
  });

  test('should preserve error in chain', () => {
    const result: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    const chained = andThen(result, (n) => ok(n + 10));

    expect(chained.ok).toBe(false);
  });

  test('should unwrap or default', () => {
    const success: Result<number> = ok(42);
    expect(unwrapOr(success, 0)).toBe(42);

    const failure: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    expect(unwrapOr(failure, 0)).toBe(0);
  });

  test('should unwrap error', () => {
    const error: ErrorValue = { code: ErrorCode.InternalError, message: 'Error' };
    const result: Result<number> = err(error);

    const unwrapped = unwrapError(result);
    expect(unwrapped).toEqual(error);

    const success: Result<number> = ok(42);
    expect(unwrapError(success)).toBeNull();
  });
});

describe('Error Helpers', () => {
  test('should create validation error', () => {
    const error = validationError('email', 'Invalid email format');

    expect(error.code).toBe(ErrorCode.ValidationFailed);
    expect(error.field).toBe('email');
    expect(error.message).toBe('Invalid email format');
  });

  test('should create not found error', () => {
    const error = notFoundError('User', 123);

    expect(error.code).toBe(ErrorCode.ResourceNotFound);
    expect(error.message).toContain('User not found: 123');
    expect(error.context).toEqual({ resource: 'User', id: '123' });
  });

  test('should create internal error', () => {
    const error = internalError('Something went wrong', 'Cause');

    expect(error.code).toBe(ErrorCode.InternalError);
    expect(error.message).toBe('Something went wrong');
    expect(error.cause).toBe('Cause');
  });
});

describe('toUserMessage', () => {
  test('should show field-specific message for validation errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.ValidationFailed,
      message: 'Invalid format',
      field: 'email',
    };

    expect(toUserMessage(error)).toBe('email: Invalid format');
  });

  test('should show helpful message for not found errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.ResourceNotFound,
      message: 'User not found',
    };

    expect(toUserMessage(error)).toBe('User not found');
  });

  test('should show helpful message for database errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbConnectionFailed,
      message: 'Connection refused',
    };

    expect(toUserMessage(error)).toContain('database');
  });

  test('should show generic message for unknown errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.Unknown,
      message: '',
    };

    expect(toUserMessage(error)).toContain('error occurred');
  });

  test('should handle duplicate constraint errors', () => {
    const error: ErrorValue = {
      code: ErrorCode.DbQueryFailed,
      message: 'duplicate key value',
    };

    expect(toUserMessage(error)).toContain('already exists');
  });
});

describe('logError', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should log error to console', () => {
    const error: ErrorValue = {
      code: ErrorCode.InternalError,
      message: 'Test error',
    };

    logError(error, 'TestContext');

    expect(consoleErrorSpy).toHaveBeenCalled();
    const callArgs = consoleErrorSpy.mock.calls[0][0];
    expect(callArgs).toContain('[TestContext]');
    expect(callArgs).toContain('INTERNAL_ERROR');
  });
});

describe('unwrap', () => {
  test('should return value for success', () => {
    const result: Result<number> = ok(42);
    expect(unwrap(result)).toBe(42);
  });

  test('should throw for error', () => {
    const result: Result<number> = err({ code: ErrorCode.InternalError, message: 'Error' });
    expect(() => unwrap(result)).toThrow();
  });
});
