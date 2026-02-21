// Angular core mocks for Bun testing
// These mocks allow testing Angular services without the full Angular runtime

// Mock for @Injectable decorator (no-op for testing)
export function Injectable(options?: { providedIn?: string }) {
  return function (constructor: Function) {
    // No-op decorator for Bun tests
  };
}

// Mock for signal (simplified implementation for testing)
export function signal<T>(initialValue: T) {
  let value = initialValue;
  
  const sig = function() { return value; } as any;
  
  sig.set = (newValue: T) => { value = newValue; };
  sig.update = (fn: (v: T) => T) => { value = fn(value); };
  sig.asReadonly = () => sig;
  
  return sig;
}

// Mock for computed
export function computed<T>(fn: () => T) {
  return {
    (): T { return fn(); },
    asReadonly: () => computed(fn)
  };
}

// Mock for inject
export function inject<T>(token: Function | string): T {
  // Return undefined or mock - tests should provide their own dependencies
  return undefined as T;
}

// Mock for TestBed
export const TestBed = {
  configureTestingModule: (moduleDef: any) => TestBed,
  compileComponents: () => Promise.resolve(),
  inject: <T>(token: Function | string): T => undefined as T,
  get: <T>(token: Function | string): T => undefined as T,
};

// Mock for Component decorator
export function Component(options: any) {
  return function (constructor: Function) {
    // No-op decorator for Bun tests
  };
}

// Mock for NgModule decorator
export function NgModule(options: any) {
  return function (constructor: Function) {
    // No-op decorator for Bun tests
  };
}

// Mock for Input/Output decorators
export function Input(alias?: string) {
  return function (target: any, propertyKey: string) {};
}

export function Output(alias?: string) {
  return function (target: any, propertyKey: string) {};
}

// Mock for ViewChild
export function ViewChild(selector: any, opts?: any) {
  return function (target: any, propertyKey: string) {};
}

// Mock for OnInit, OnDestroy, etc. lifecycle hooks (just types)
export interface OnInit {
  ngOnInit(): void;
}

export interface OnDestroy {
  ngOnDestroy(): void;
}

export interface OnChanges {
  ngOnChanges(changes: any): void;
}

export interface AfterViewInit {
  ngAfterViewInit(): void;
}

export interface AfterViewChecked {
  ngAfterViewChecked(): void;
}

export interface DoCheck {
  ngDoCheck(): void;
}

export interface OnChanges {
  ngOnChanges(changes: any): void;
}

export interface SimpleChange {
  previousValue: any;
  currentValue: any;
  firstChange: boolean;
  isFirstChange(): boolean;
}

// Mock for EventEmitter
export class EventEmitter<T = any> {
  emit(value?: T): void {}
  subscribe(next?: (value: T) => void): any { return () => {}; }
}

// Mock for Output
export function OutputMock(alias?: string) {
  return new EventEmitter();
}
