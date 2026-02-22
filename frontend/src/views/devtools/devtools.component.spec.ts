import { describe, test, expect, beforeEach, jest } from 'bun:test';
import { TestBed } from '@angular/core/testing';
import { DevToolsComponent } from './devtools.component';
import { DevToolsService } from '../../viewmodels/devtools.service';
import { EventBusViewModel } from '../../viewmodels/event-bus.viewmodel';

// Mock DevToolsService
const mockDevToolsService = {
  init: jest.fn(),
  gatherAllData: jest.fn().mockResolvedValue(undefined),
  startAutoRefresh: jest.fn(),
  stopAutoRefresh: jest.fn(),
  exportData: jest.fn().mockReturnValue('{}'),
  systemInfo: jest.fn().mockReturnValue(null),
  memoryInfo: jest.fn().mockReturnValue(null),
  processInfo: jest.fn().mockReturnValue(null),
  networkInfo: jest.fn().mockReturnValue(null),
  databaseInfo: jest.fn().mockReturnValue(null),
  configInfo: jest.fn().mockReturnValue(null),
  performance: jest.fn().mockReturnValue(null),
  environment: jest.fn().mockReturnValue(null),
  events: jest.fn().mockReturnValue([]),
  bindings: jest.fn().mockReturnValue([]),
  windows: jest.fn().mockReturnValue([]),
  logs: jest.fn().mockReturnValue([]),
  clearEvents: jest.fn(),
} as unknown as DevToolsService;

// Mock EventBusViewModel  
const mockEventBus = {} as EventBusViewModel<Record<string, unknown>>;

describe('DevToolsComponent', () => {
  let component: DevToolsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DevToolsComponent],
      providers: [
        { provide: DevToolsService, useValue: mockDevToolsService },
        { provide: EventBusViewModel, useValue: mockEventBus },
      ],
    });
    const fixture = TestBed.createComponent(DevToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create the component', () => {
    expect(component).toBeDefined();
  });

  test('should have tabs defined', () => {
    expect(component.tabs).toBeDefined();
    expect(component.tabs.length).toBeGreaterThan(0);
  });

  test('should have 12 tabs', () => {
    expect(component.tabs.length).toBe(12);
  });

  test('should have overview as initial active tab', () => {
    expect(component.activeTab()).toBe('overview');
  });

  test('should select tab when selectTab is called', () => {
    component.selectTab('system');
    expect(component.activeTab()).toBe('system');
  });
});
