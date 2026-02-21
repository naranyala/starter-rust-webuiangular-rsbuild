# Testing Guide

This document describes the testing strategy and how to run tests for the Rust WebUI Angular application.

## Overview

The project uses a comprehensive testing approach with:

- **Backend (Rust)**: Unit tests and integration tests using Cargo's built-in test framework
- **Frontend (Angular)**: Unit tests using Jasmine and Karma

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

### Frontend Tests

Run only frontend (Angular) tests:

```bash
./run.sh --test-frontend
# Or from frontend directory
cd frontend
bun run test
```

Run tests in watch mode:

```bash
cd frontend
bun run test:watch
```

Run tests with coverage:

```bash
cd frontend
bun run test:ci
```

## Test Structure

### Backend Tests

```
src/
├── core/
│   ├── error.rs              # Unit tests inline
│   └── infrastructure/
│       ├── database/
│       │   └── mod.rs        # Database module tests
│       └── di.rs             # DI container tests
│
tests/
├── common/
│   └── mod.rs                # Test utilities and fixtures
├── integration_db_handlers.rs    # Database integration tests
└── integration_error_handling.rs # Error handling tests
```

#### Test Categories

1. **Unit Tests** (inline in source files)
   - Test individual functions and methods
   - Use mocks for dependencies
   - Fast execution

2. **Integration Tests** (in `tests/` directory)
   - Test component interactions
   - Use real database (in-memory/temp file)
   - Test full request/response flow

#### Test Fixtures

The `tests/common/mod.rs` provides reusable test fixtures:

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

### Frontend Tests

```
frontend/src/
├── types/
│   └── error.types.spec.ts       # Error type tests
├── core/
│   └── global-error.service.spec.ts  # Error service tests
└── viewmodels/
    ├── event-bus.viewmodel.spec.ts   # Event bus tests
    └── logger.spec.ts                # Logger tests
```

#### Test Patterns

1. **Unit Tests**
   - Test individual services and components
   - Use Jasmine spies for mocking
   - Run in headless Chrome

2. **Test Utilities**
   - `TestBed` for Angular DI
   - `jasmine.createSpy()` for mocks
   - Custom matchers for common assertions

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

### Frontend (TypeScript)

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceName);
  });
  
  it('should do something', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = service.method(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

#### Testing Async Code

```typescript
it('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

it('should handle observables', (done) => {
  service.observable$.subscribe(value => {
    expect(value).toBe(expected);
    done();
  });
});
```

#### Using Spies

```typescript
it('should call dependency', () => {
  const spy = spyOn(dependency, 'method').and.returnValue(mock);
  
  service.method();
  
  expect(spy).toHaveBeenCalled();
});
```

## Test Coverage

### Backend

Generate coverage report (requires cargo-tarpaulin):

```bash
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

View report in `./tarpaulin-report.html`

### Frontend

Generate coverage report:

```bash
cd frontend
bun run test:ci
```

View report in `frontend/coverage/`

## Continuous Integration

Tests are designed to run in CI environments:

```bash
# CI-friendly test command
./run.sh --test

# Or separately
cargo test --locked --no-fail-fast
cd frontend && bun run test:ci
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

### Frontend

1. **Use TestBed**: Leverage Angular's testing utilities
2. **Mock Services**: Don't call real APIs in unit tests
3. **Test User Flows**: Test from user perspective
4. **Handle Async**: Use async/await or fakeAsync

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

### Frontend

**Tests not running:**
```bash
# Check Karma configuration
cat frontend/karma.conf.js
```

**Headless Chrome errors:**
```bash
# Install Chrome for testing
sudo apt-get install chromium-browser  # Linux
# or
brew install chromium  # macOS
```

## Future Improvements

Consider adding:

1. **End-to-End Tests**: Full application flow testing
2. **Performance Tests**: Benchmark critical paths
3. **Visual Regression Tests**: UI consistency checks
4. **Contract Tests**: Backend-frontend API compatibility

## Resources

- [Rust Testing Documentation](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Mockall Documentation](https://docs.rs/mockall/)
