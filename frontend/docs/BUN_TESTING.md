# Bun Testing Migration Guide

This guide explains how to run tests using Bun's native test runner instead of Karma/Jasmine.

## Overview

The project now supports **Bun's built-in test runner** as an alternative to Karma/Jasmine. Bun tests are:

- **Faster**: No browser overhead, runs directly in Bun runtime
- **Simpler**: No Karma configuration, no browser setup
- **Compatible**: Uses Jest-like API (`describe`, `test`, `expect`, `jest.fn()`)

## Running Tests

### Quick Start

```bash
cd frontend
bun test
```

### Test Commands

```bash
# Run all Bun tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/types/error.types.test.ts

# Run tests matching a pattern
bun test error
bun test event-bus
```

### From Project Root

```bash
./run.sh --test-frontend   # Runs Bun tests if available
./run.sh --test            # Runs backend + frontend tests
```

## Test File Naming

Bun tests use the `.test.ts` suffix (Jasmine/Karma tests use `.spec.ts`):

```
src/
├── types/
│   ├── error.types.ts           # Source code
│   ├── error.types.spec.ts      # Karma test (legacy)
│   └── error.types.test.ts      # Bun test (new)
└── viewmodels/
    ├── logger.ts                # Source code
    ├── logger.spec.ts           # Karma test (legacy)
    └── logger.test.ts           # Bun test (new)
```

## Current Test Status

| Test File | Status | Tests | Pass | Fail |
|-----------|--------|-------|------|------|
| error.types.test.ts | ✅ Complete | 29 | 29 | 0 |
| event-bus.viewmodel.test.ts | ✅ Complete | 29 | 29 | 0 |
| global-error.service.test.ts | ⚠️ Partial | 28 | 25 | 3 |
| logger.test.ts | ⏸️ Skipped | - | - | - |

**Note**: Logger tests are excluded from Bun runs due to complex Angular dependencies. Use Karma for those tests.

## API Mapping

| Jasmine/Karma | Bun Test |
|--------------|----------|
| `describe()` | `describe()` |
| `it()` | `test()` |
| `beforeEach()` | `beforeEach()` |
| `afterEach()` | `afterEach()` |
| `expect().toBe()` | `expect().toBe()` |
| `expect().toEqual()` | `expect().toEqual()` |
| `jasmine.createSpy()` | `jest.fn()` |
| `spyOn()` | `jest.spyOn()` |

### Example Migration

**Before (Jasmine/Karma):**
```typescript
import { TestBed } from '@angular/core/testing';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should do something', () => {
    const result = service.method();
    expect(result).toBe('expected');
  });
});
```

**After (Bun):**
```typescript
import { describe, test, expect, beforeEach } from 'bun:test';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  test('should do something', () => {
    const result = service.method();
    expect(result).toBe('expected');
  });
});
```

## Spies and Mocks

Bun provides Jest-compatible spying and mocking:

### Creating Spies

```typescript
import { jest } from 'bun:test';

// Spy on object method
const obj = { method: () => 'original' };
const spy = jest.spyOn(obj, 'method').mockReturnValue('mocked');

// Create mock function
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockImplementation((x) => x * 2);

// Check calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1');
```

### Mocking Console

```typescript
import { jest } from 'bun:test';

let consoleSpy: ReturnType<typeof jest.spyOn>;

beforeEach(() => {
  consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  consoleSpy.mockRestore();
});

test('should log message', () => {
  console.log('test');
  expect(consoleSpy).toHaveBeenCalled();
});
```

## Async Testing

Bun has excellent async/await support:

```typescript
test('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBe('expected');
});

test('should handle promises', async () => {
  await expect(promise).resolves.toBe('value');
  await expect(rejectedPromise).rejects.toThrow();
});
```

## Configuration

### bunfig.toml

Test configuration in `frontend/bunfig.toml`:

```toml
[test]
root = "./src"
coverage = false
coverageDir = "./coverage"
coverageReporters = ["text", "lcov"]
reporter = ["pretty"]
```

### Test Setup

Global setup in `frontend/test/setup.ts`:

```typescript
import { beforeEach, afterEach } from 'bun:test';

beforeEach(() => {
  // Global setup
});

afterEach(() => {
  // Global cleanup
});
```

## Coverage

Generate coverage report:

```bash
bun test --coverage
```

View coverage in `frontend/coverage/`:
- `lcov-report/index.html` - HTML report
- `coverage-final.json` - JSON report

## Migrating Existing Tests

### Step 1: Create Bun Version

Copy your `.spec.ts` file to `.bun.spec.ts`:

```bash
cp src/service.spec.ts src/service.bun.spec.ts
```

### Step 2: Update Imports

Replace Jasmine imports with Bun:

```typescript
// Before
import { TestBed } from '@angular/core/testing';

// After
import { describe, test, expect, beforeEach, afterEach, jest } from 'bun:test';
```

### Step 3: Replace TestBed (if possible)

For services without heavy Angular dependencies:

```typescript
// Before
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [MyService, MockDependency]
  });
  service = TestBed.inject(MyService);
});

// After
beforeEach(() => {
  const mockDep = { method: jest.fn() };
  service = new MyService(mockDep);
});
```

### Step 4: Update Spies

```typescript
// Before
const spy = jasmine.createSpy('spy');
spyOn(service, 'method').and.returnValue(42);

// After
const spy = jest.fn();
jest.spyOn(service, 'method').mockReturnValue(42);
```

### Step 5: Run and Verify

```bash
bun test src/service.bun.spec.ts
```

## When to Use Bun vs Karma

| Use Bun When | Use Karma When |
|-------------|----------------|
| Testing pure logic | Testing Angular components |
| Testing services | Testing templates |
| Testing utilities | Testing DOM interactions |
| CI/CD (faster) | Browser-specific behavior |
| Quick feedback | E2E-like scenarios |

## Troubleshooting

### "Cannot find module"

Make sure imports use relative paths:
```typescript
// Correct
import { service } from './service';

// May fail
import { service } from 'src/service';
```

### "window is not defined"

Bun runs in Node-like environment. Mock browser APIs:

```typescript
// Mock window
const mockWindow = {
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};
global.window = mockWindow as any;
```

### Coverage Not Generated

Ensure `coverage = true` in `bunfig.toml`:
```toml
[test]
coverage = true
```

## Best Practices

1. **Keep both test suites during migration** - Don't delete Karma tests until Bun tests are verified
2. **Start with simple tests** - Migrate utility functions and pure services first
3. **Mock Angular dependencies** - Don't try to run Angular DI in Bun
4. **Use `.bun.spec.ts` suffix** - Clear distinction from Karma tests
5. **Test in CI** - Add `bun test --coverage` to CI pipeline

## Next Steps

1. Run existing Bun tests: `bun test`
2. Migrate one test file at a time
3. Compare coverage between Bun and Karma
4. Update CI/CD to use Bun tests
5. Consider deprecating Karma for unit tests

## Resources

- [Bun Test Documentation](https://bun.sh/docs/runtime/test)
- [Bun Jest Compatibility](https://bun.sh/docs/runtime/test#jest-compatibility)
- [Migration Discussion](https://github.com/oven-sh/bun/issues/108)
