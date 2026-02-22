# Testing Guide

This document describes the testing strategy and how to run tests for the Rust WebUI Angular application.

## Overview

The project uses a comprehensive testing approach with:

- **Backend (Rust)**: Unit tests and integration tests using Cargo built-in test framework
- **Frontend (Bun Test)**: Unit tests using Bun Test (fast, built-in test runner)

## Running Tests

### All Tests

Run all tests (backend + frontend) from the project root:

```bash
./run.sh --test
```

### Backend Tests

Run only backend (Rust) tests:

```bash
./run.sh --test-backend
# Or directly
cargo test
```

Run specific test:

```bash
cargo test test_error_value_creation
```

Run tests with output:

```bash
cargo test -- --nocapture
```

Run tests matching a pattern:

```bash
cargo test error
```

### Frontend Tests (Bun Test)

Run only frontend (Bun) tests:

```bash
./run.sh --test-frontend
# Or from frontend directory
cd frontend
bun test
```

Run tests in watch mode:

```bash
cd frontend
bun test --watch
```

Run tests with coverage:

```bash
cd frontend
bun test --coverage
```

Run specific test file:

```bash
cd frontend
bun test src/views/home/home.component.spec.ts
```

Run tests matching a pattern:

```bash
cd frontend
bun test --test-name-pattern "should create"
```

## Test Structure

### Backend Tests

```
src/
+-- core/
|   +-- error.rs              # Unit tests inline
|   +-- infrastructure/
|       +-- database/
|       |   +-- mod.rs        # Database module tests
|       +-- di.rs             # DI container tests
+-- utils/
    +-- */mod.rs              # Utility module tests

tests/
+-- common/
|   +-- mod.rs                # Test utilities and fixtures
+-- integration_db_handlers.rs    # Database integration tests
+-- integration_error_handling.rs # Error handling tests
```

#### Test Categories

1. **Unit Tests** (inline in source files)
   - Test individual functions and methods
   - Use mocks for dependencies
   - Fast execution

2. **Integration Tests** (in tests/ directory)
   - Test component interactions
   - Use real database (in-memory/temp file)
   - Test full request/response flow

#### Test Fixtures

The tests/common/mod.rs provides reusable test fixtures:

```rust
use crate::common::DatabaseFixture;

#[test]
fn test_with_fixture() {
    // Fresh database for each test
    let fixture = DatabaseFixture::new();

    // Database with sample data
    let fixture = DatabaseFixture::with_sample_data();
}
```

### Frontend Tests (Bun Test)

```
frontend/src/
+-- viewmodels/
|   +-- devtools.service.spec.ts    # DevTools service tests
+-- views/
    +-- home/
    |   +-- home.component.spec.ts  # Home component tests
    +-- devtools/
        +-- devtools.component.spec.ts # DevTools component tests
```

#### Test Configuration Files

- `bunfig.toml`: Bun Test configuration
- `tsconfig.spec.json`: TypeScript configuration for tests
- `src/test-setup.ts`: Test setup and Angular initialization

#### Test Patterns

1. **Component Tests**
   - Test Angular components with TestBed
   - Use fixture.detectChanges() for change detection
   - Query native element for DOM assertions

2. **Service Tests**
   - Test services with mocked dependencies
   - Use jest.fn() for mocking
   - Test both sync and async operations

3. **Pipe/Directive Tests**
   - Test pure functions directly
   - No TestBed needed for pipes
   - Use DebugElement for directive tests

## Writing Tests

### Backend (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_feature() {
        // Arrange
        let input = ...;

        // Act
        let result = function_under_test(input);

        // Assert
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), expected);
    }

    #[test]
    #[should_panic(expected = "error message")]
    fn test_panic() {
        // Test that code panics as expected
    }
}
```

#### Integration Test Example

```rust
// tests/integration_example.rs
mod common;

use crate::common::DatabaseFixture;

#[test]
fn test_database_operation() {
    // Arrange
    let fixture = DatabaseFixture::new();

    // Act
    let result = fixture.db.insert_user("Name", "email@test.com", "User", "Active");

    // Assert
    assert!(result.is_ok());
    let user_id = result.unwrap();
    assert!(user_id > 0);
}
```

### Frontend (Bun Test)

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create the component', () => {
    expect(component).toBeDefined();
  });

  test('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('My App');
  });
});
```

#### Testing Async Code

```typescript
// Async/await
test('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

// Promises with resolves/rejects
test('should resolve promise', async () => {
  await expect(service.getPromise()).resolves.toBe('value');
});

test('should reject promise', async () => {
  await expect(service.getRejectedPromise()).rejects.toThrow();
});
```

#### Using Mocks

```typescript
import { jest } from 'bun:test';

// Mock a function
const mockFn = jest.fn();
mockFn.mockReturnValue(42);

// Spy on a method
const spy = jest.spyOn(object, 'method');
spy.mockImplementation(() => 'mocked');

// Mock a service
const mockService = {
  getData: jest.fn().mockResolvedValue({ id: 1 }),
};

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

## Test Coverage

### Backend

Generate coverage report (requires cargo-tarpaulin):

```bash
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

View report in ./tarpaulin-report.html

### Frontend (Bun Test)

Generate coverage report:

```bash
cd frontend
bun test --coverage
```

View reports in:
- frontend/coverage/lcov-report/index.html (HTML)
- frontend/coverage/coverage-final.json (JSON)
- Console output (text)

Coverage is automatically generated with:
- Lines covered
- Functions covered
- Branches covered
- Statements covered

## Continuous Integration

Tests are designed to run in CI environments:

```bash
# CI-friendly test command
./run.sh --test

# Or separately
cargo test --locked --no-fail-fast
cd frontend && bun test --coverage
```

## Best Practices

### General

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should describe expected behavior
3. **Arrange-Act-Assert**: Follow AAA pattern for test structure
4. **One Assertion Per Concept**: Test one thing per test

### Backend

1. **Use Fixtures**: Reuse test setup code
2. **Test Edge Cases**: Empty inputs, errors, boundaries
3. **Mock External Dependencies**: Don't rely on external services
4. **Use Temp Files**: Clean up after file system tests

### Frontend (Bun Test)

1. **Use `toBeDefined()` for Components**: Prefer `expect(component).toBeDefined()` over `toBeTruthy()`
2. **Use `async/await`**: Prefer async/await over callbacks or done()
3. **Clean Up After Tests**: Use `afterEach(() => { jest.clearAllMocks(); })`
4. **Mock External Services**: Don't call real APIs in unit tests
5. **Test One Thing Per Test**: Keep tests focused and atomic
6. **Use Descriptive Test Names**: `should return empty array when no users exist`
7. **Leverage Bun Test Speed**: Run tests frequently during development

## DevTools Testing

The DevTools service can be tested with mocked backend responses:

```typescript
import { describe, test, expect, beforeEach, jest } from 'bun:test';

describe('DevToolsService', () => {
  let service: DevToolsService;
  let mockEventBus: any;

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };
    service = new DevToolsService(mockEventBus);
  });

  test('should gather system info', async () => {
    await service.gatherSystemInfo();

    const systemInfo = service.systemInfo();
    expect(systemInfo).toBeDefined();
  });

  test('should add event to events log', () => {
    service.addEvent('info', 'test-source', 'Test message');
    
    const events = service.events();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].source).toBe('test-source');
  });

  test('should export data as JSON string', () => {
    const jsonData = service.exportData();
    
    expect(typeof jsonData).toBe('string');
    expect(() => JSON.parse(jsonData)).not.toThrow();
  });
});
```

## Troubleshooting

### Backend

**Tests not found:**
```bash
# Make sure tests are in #[cfg(test)] modules
cargo test -- --list
```

**Database tests failing:**
```bash
# Check temp directory permissions
ls -la /tmp
```

**Mocking issues:**
```bash
# Ensure mockall is in dev-dependencies
# cargo add mockall --dev
```

### Frontend (Bun Test)

**Tests not running:**
```bash
# Check bunfig.toml configuration
cat bunfig.toml

# Ensure test files match pattern *.spec.ts
find src -name "*.spec.ts"
```

**Test setup errors:**
```bash
# Ensure test-setup.ts exists and is loaded
cat src/test-setup.ts

# Check that zone.js is installed
bun install zone.js
```

**Coverage not generated:**
```bash
# Ensure coverage is enabled in bunfig.toml
# coverageEnabled = true

# Run with --coverage flag
bun test --coverage
```

**Mock not working:**
```bash
# Use jest.fn() for mocks
const mockFn = jest.fn();

# Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

**Angular TestBed errors:**
```bash
# Ensure test-setup.ts initializes TestBed
# Import components properly in TestBed.configureTestingModule
```

## Future Improvements

Consider adding:

1. **End-to-End Tests**: Full application flow testing
2. **Performance Tests**: Benchmark critical paths
3. **Visual Regression Tests**: UI consistency checks
4. **Contract Tests**: Backend-frontend API compatibility
5. **DevTools Integration Tests**: Test DevTools panels with mock data

## Resources

- Rust Testing Documentation: https://doc.rust-lang.org/book/ch11-00-testing.html
- Bun Test Documentation: https://bun.sh/docs/cli/test
- Bun Jest Compatibility: https://bun.sh/docs/runtime/jest
- Angular Testing Guide: https://angular.io/guide/testing
- Frontend Bun Test Guide: frontend/docs/BUN_TEST_GUIDE.md
