// Bun test setup file
// Configures global test utilities and mocks

import { beforeEach, afterEach, expect } from 'bun:test';

// Global test configuration
export const TEST_CONFIG = {
  timeout: 5000,
  retry: 0,
};

// Mock for CustomEvent (needed for event bus tests)
class MockCustomEvent {
  type: string;
  detail: unknown;

  constructor(type: string, options?: { detail?: unknown }) {
    this.type = type;
    this.detail = options?.detail ?? null;
  }
}

// Mock for window object
export function createMockWindow() {
  const listeners = new Map<string, Set<Function>>();

  return {
    addEventListener: (event: string, handler: Function, options?: { once?: boolean }) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
    },
    removeEventListener: (event: string, handler: Function) => {
      listeners.get(event)?.delete(handler);
    },
    dispatchEvent: (event: MockCustomEvent) => {
      const handlers = listeners.get(event.type) || new Set();
      handlers.forEach(handler => handler(event));
      return true;
    },
    CustomEvent: MockCustomEvent,
  };
}

// Spy utility
export interface SpyFn<T extends Function = Function> {
  (...args: Parameters<T>): ReturnType<T>;
  calls: { args: unknown[]; result: unknown }[];
  called: boolean;
  callCount: number;
  mockReturnValue: (value: unknown) => void;
  mockImplementation: (fn: T) => void;
  mockRestore: () => void;
  mockClear: () => void;
}

export function createSpy<T extends Function = Function>(originalFn?: T): SpyFn<T> {
  const calls: { args: unknown[]; result: unknown }[] = [];
  let impl: T = originalFn || (() => {});
  let returnValue: unknown = undefined;
  let hasReturnValue = false;

  const spy = function(...args: unknown[]) {
    const result = hasReturnValue ? returnValue : impl(...args);
    calls.push({ args, result });
    return result;
  } as SpyFn<T>;

  spy.calls = calls;
  spy.called = false;
  spy.callCount = 0;

  spy.mockReturnValue = (value: unknown) => {
    hasReturnValue = true;
    returnValue = value;
  };

  spy.mockImplementation = (fn: T) => {
    impl = fn;
    hasReturnValue = false;
  };

  spy.mockRestore = () => {
    impl = originalFn || (() => {});
    hasReturnValue = false;
  };

  spy.mockClear = () => {
    calls.length = 0;
  };

  // Proxy to track called status
  return new Proxy(spy, {
    apply(target, thisArg, args) {
      const result = Reflect.apply(target, thisArg, args);
      (target as any).called = true;
      (target as any).callCount = calls.length;
      return result;
    },
  });
}

// Mock console for testing
export function mockConsole() {
  const logs: { level: string; args: unknown[] }[] = [];

  return {
    logs,
    restore: () => {
      // Restore if needed
    },
    clear: () => {
      logs.length = 0;
    },
  };
}

// Angular TestBed mock for simple DI
export class MockTestBed {
  private providers = new Map<string, unknown>();

  static configureTestingModule(moduleDef: { providers?: Array<{ provide: string; useClass?: Function; useValue?: unknown }> }) {
    const testBed = new MockTestBed();
    moduleDef.providers?.forEach(provider => {
      if ('provide' in provider) {
        testBed.providers.set(
          provider.provide,
          provider.useClass ? new (provider.useClass as any)() : provider.useValue
        );
      }
    });
    return testBed;
  }

  inject<T>(token: string | Function): T {
    const key = typeof token === 'string' ? token : token.name;
    return this.providers.get(key) as T;
  }
}

// Extend expect with custom matchers if needed
expect.extend({
  toBeFunction(received) {
    const pass = typeof received === 'function';
    return {
      pass,
      message: () => `expected ${received} to be a function`,
    };
  },
});

// Global beforeEach/afterEach hooks
beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllMocks?.();
});
