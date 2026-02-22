import { describe, test, expect, beforeEach, jest } from 'bun:test';
import { TestBed } from '@angular/core/testing';
import { DevToolsService } from '../viewmodels/devtools.service';
import { EventBusViewModel } from '../viewmodels/event-bus.viewmodel';

// Mock EventBusViewModel
const mockEventBus = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
} as unknown as EventBusViewModel<Record<string, unknown>>;

describe('DevToolsService', () => {
  let service: DevToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DevToolsService,
        { provide: EventBusViewModel, useValue: mockEventBus },
      ],
    });
    service = TestBed.inject(DevToolsService);
  });

  test('should be created', () => {
    expect(service).toBeDefined();
  });

  test('should initialize with null system info', () => {
    expect(service.systemInfo()).toBeNull();
  });

  test('should initialize with null memory info', () => {
    expect(service.memoryInfo()).toBeNull();
  });

  test('should initialize with empty events array', () => {
    expect(service.events()).toEqual([]);
  });

  test('should add event to events log', () => {
    service.addEvent('info', 'test-source', 'Test message', { key: 'value' });
    
    const events = service.events();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].source).toBe('test-source');
    expect(events[0].message).toBe('Test message');
    expect(events[0].type).toBe('info');
  });

  test('should export data as JSON string', () => {
    const jsonData = service.exportData();
    expect(typeof jsonData).toBe('string');
    expect(() => JSON.parse(jsonData)).not.toThrow();
  });
});
