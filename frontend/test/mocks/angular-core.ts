// Mock for @angular/core in Bun tests
// This file is used when Bun imports @angular/core

export const Injectable = (options?: any) => (constructor: Function) => {};
export const Component = (options: any) => (constructor: Function) => {};
export const NgModule = (options: any) => (constructor: Function) => {};
export const Input = (alias?: string) => (target: any, key: string) => {};
export const Output = (alias?: string) => (target: any, key: string) => {};
export const ViewChild = (selector: any, opts?: any) => (target: any, key: string) => {};

export function signal<T>(initialValue: T) {
  let value = initialValue;
  const sig = function() { return value; } as any;
  sig.set = (newValue: T) => { value = newValue; };
  sig.update = (fn: (v: T) => T) => { value = fn(value); };
  sig.asReadonly = () => sig;
  return sig;
}

export function computed<T>(fn: () => T) {
  const result = function() { return fn(); } as any;
  result.asReadonly = () => result;
  return result;
}

export function inject<T>(token: Function | string): T {
  return undefined as T;
}

export const TestBed = {
  configureTestingModule: () => TestBed,
  compileComponents: () => Promise.resolve(),
  inject: <T>() => undefined as T,
  get: <T>() => undefined as T,
};

export interface OnInit { ngOnInit(): void; }
export interface OnDestroy { ngOnDestroy(): void; }
export interface OnChanges { ngOnChanges(changes: any): void; }
export interface AfterViewInit { ngAfterViewInit(): void; }

export class EventEmitter<T = any> {
  emit(value?: T) {}
  subscribe(next?: (value: T) => void) { return () => {}; }
}

export class ElementRef {
  constructor(public nativeElement: any) {}
}

export class TemplateRef {
  elementRef: ElementRef;
}

export class ViewContainerRef {
  element: ElementRef;
}

export class ChangeDetectorRef {
  markForCheck() {}
  detach() {}
  detectChanges() {}
  checkNoChanges() {}
  markAndPush() {}
}

export class ErrorHandler {
  handleError(error: any): void {
    console.error(error);
  }
}

export const VERSION = {
  full: '19.0.0-mock',
  major: '19',
  minor: '0',
  patch: '0',
};
