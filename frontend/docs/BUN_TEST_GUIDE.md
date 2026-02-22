# Bun Test Guide for Angular

This guide explains how to write and run tests using Bun Test in the Angular application.

## Overview

Bun Test is a fast, built-in test runner that comes with the Bun runtime. It provides:

- Fast test execution (10-100x faster than Jest)
- Built-in coverage reporting
- Simple API compatible with Jest/Jasmine
- Native TypeScript support
- Zero configuration needed

## Migration from Jasmine/Karma

### Key Changes

1. **Test Syntax**: `it` becomes `test` (though `it` still works)
2. **Matchers**: Most Jasmine matchers work, but use `toBeDefined()` instead of `toBeTruthy()` for components
3. **Setup**: Replace `karma.conf.js` with `bunfig.toml`
4. **Test Bed**: Use `test-setup.ts` instead of `test.ts`

### Before (Jasmine/Karma)

```typescript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### After (Bun Test)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create the component', () => {
    expect(component).toBeDefined();
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/views/home/home.component.spec.ts

# Run tests matching a pattern
bun test --test-name-pattern "should create"
```

### NPM Scripts

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:ci
```

## Writing Tests

### Test Structure

```typescript
import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from 'bun:test';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeAll(() => {
    // Run once before all tests
  });

  afterAll(() => {
    // Run once after all tests
  });

  beforeEach(() => {
    // Run before each test
  });

  afterEach(() => {
    // Run after each test
  });

  test('should do something', () => {
    // Test implementation
  });
});
```

### Common Matchers

```typescript
// Equality
expect(value).toBe(42);
expect(value).toEqual({ key: 'value' });
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(value).toBeCloseTo(3.14, 2);

// Strings
expect(value).toContain('substring');
expect(value).toMatch(/regex/);

// Arrays
expect(array).toContain('item');
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', 'value');

// Functions
expect(fn).toThrow();
expect(fn).toThrowError('error message');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

### Async Tests

```typescript
// Async/await
test('should fetch data', async () => {
  const data = await service.getData();
  expect(data).toBeDefined();
});

// Promises
test('should resolve promise', () => {
  return expect(service.getPromise()).resolves.toBe('value');
});

test('should reject promise', () => {
  return expect(service.getRejectedPromise()).rejects.toThrow();
});
```

### Mocking

```typescript
import { jest } from 'bun:test';

// Mock a function
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockImplementation(() => 'value');

// Mock a module
jest.mock('../service', () => ({
  myService: {
    getData: () => 'mocked data',
  },
}));

// Spy on a method
const spy = jest.spyOn(object, 'method');
spy.mockImplementation(() => 'mocked');

// Restore spies
afterEach(() => {
  jest.restoreAllMocks();
});
```

## Testing Angular Components

### Basic Component Test

```typescript
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

  test('should create', () => {
    expect(component).toBeDefined();
  });

  test('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('My App');
  });
});
```

### Component with Inputs

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user',
  template: '<span>{{ name }}</span>',
})
class UserComponent {
  @Input() name = '';
}

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    component.name = 'John';
    fixture.detectChanges();
  });

  test('should display user name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John');
  });
});
```

### Component with Outputs

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: '<button (click)="onClick()">Click</button>',
})
class ButtonComponent {
  @Output() clicked = new EventEmitter<void>();
  
  onClick() {
    this.clicked.emit();
  }
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should emit clicked event', () => {
    const spy = jest.fn();
    component.clicked.subscribe(spy);
    
    component.onClick();
    
    expect(spy).toHaveBeenCalled();
  });
});
```

## Testing Services

### Basic Service Test

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  test('should be created', () => {
    expect(service).toBeDefined();
  });

  test('should return a value', () => {
    expect(service.getValue()).toBe('expected');
  });
});
```

### Service with Dependencies

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DataService);
  });

  test('should be created', () => {
    expect(service).toBeDefined();
  });
});
```

### Service with Mocked Dependencies

```typescript
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { ApiService } from '../api/api.service';

const mockApiService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService, useValue: mockApiService },
      ],
    });
    service = TestBed.inject(UserService);
  });

  test('should fetch users', async () => {
    mockApiService.get.mockResolvedValue([{ id: 1, name: 'John' }]);
    
    const users = await service.getUsers();
    
    expect(users).toHaveLength(1);
    expect(mockApiService.get).toHaveBeenCalledWith('/users');
  });
});
```

## Testing Pipes

```typescript
import { TransformPipe } from './transform.pipe';

describe('TransformPipe', () => {
  let pipe: TransformPipe;

  beforeEach(() => {
    pipe = new TransformPipe();
  });

  test('should transform value', () => {
    expect(pipe.transform('hello')).toBe('HELLO');
  });

  test('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  test('should handle null', () => {
    expect(pipe.transform(null as any)).toBeNull();
  });
});
```

## Testing Directives

```typescript
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HighlightDirective } from './highlight.directive';

@Component({
  template: `<p appHighlight>Test</p>`,
})
class TestComponent {}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let paragraph: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightDirective],
      declarations: [TestComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    paragraph = fixture.debugElement.query(By.css('p'));
  });

  test('should create instance', () => {
    expect(paragraph).toBeDefined();
  });

  test('should apply background color', () => {
    const backgroundColor = paragraph.nativeElement.style.backgroundColor;
    expect(backgroundColor).toBeTruthy();
  });
});
```

## Best Practices

### 1. Use `toBeDefined()` for Components

```typescript
// Good
test('should create', () => {
  expect(component).toBeDefined();
});

// Avoid
test('should create', () => {
  expect(component).toBeTruthy();
});
```

### 2. Use `async/await` for Async Tests

```typescript
// Good
test('should fetch data', async () => {
  const data = await service.getData();
  expect(data).toBeDefined();
});

// Avoid
test('should fetch data', (done) => {
  service.getData().then(data => {
    expect(data).toBeDefined();
    done();
  });
});
```

### 3. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

### 4. Use Descriptive Test Names

```typescript
// Good
test('should return empty array when no users exist', () => {
  // ...
});

// Avoid
test('should work', () => {
  // ...
});
```

### 5. Test One Thing Per Test

```typescript
// Good
test('should create user', () => {
  // Test creation only
});

test('should validate user email', () => {
  // Test validation only
});

// Avoid
test('should create and validate user', () => {
  // Testing multiple things
});
```

## Configuration

### bunfig.toml

```toml
[test]
root = "./src"
include = ["**/*.spec.ts"]
exclude = ["**/node_modules/**", "**/dist/**"]
coverageEnabled = true
coverageReporter = ["text", "lcov", "html"]
timeout = 10000
tsconfig = "./tsconfig.json"
preload = ["./src/test-setup.ts"]
```

### tsconfig.spec.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["bun-types", "node"],
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.spec.ts", "src/test-setup.ts"]
}
```

## Troubleshooting

### Test Not Found

Ensure test files match the pattern `*.spec.ts` and are in the `src/` directory.

### Coverage Not Generated

Check that `coverageEnabled = true` in `bunfig.toml`.

### Angular Testing Errors

Ensure `test-setup.ts` is loaded and initializes `TestBed` correctly.

### Mock Not Working

Make sure to use `jest.fn()` for mocks and reset them in `afterEach`.

## Resources

- Bun Test Documentation: https://bun.sh/docs/cli/test
- Bun Jest Compatibility: https://bun.sh/docs/runtime/jest
- Angular Testing Guide: https://angular.io/guide/testing
