// Bun test suite for EventBusViewModel
// Tests the event bus pub/sub pattern implementation

import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import { EventBusViewModel } from './event-bus.viewmodel';

interface TestEvents {
  'user:created': { userId: number; name: string };
  'user:updated': { userId: number; changes: Record<string, unknown> };
  'user:deleted': { userId: number };
  'app:ready': { timestamp: number };
}

describe('EventBusViewModel', () => {
  let eventBus: EventBusViewModel<TestEvents>;

  beforeEach(() => {
    eventBus = new EventBusViewModel<TestEvents>();
    eventBus.init('test', 100);
  });

  afterEach(() => {
    eventBus.setEnabled(false);
  });

  describe('Initialization', () => {
    test('should initialize with namespace and max history', () => {
      const bus = new EventBusViewModel<TestEvents>();
      bus.init('myapp', 50);

      expect(bus.isEnabled()).toBe(true);
    });

    test('should be enabled by default', () => {
      expect(eventBus.isEnabled()).toBe(true);
    });

    test('should be disabled when setEnabled(false) is called', () => {
      eventBus.setEnabled(false);
      expect(eventBus.isEnabled()).toBe(false);
    });
  });

  describe('Subscription', () => {
    test('should subscribe to events', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.subscribe('user:created', handler);

      expect(unsubscribe).toBeDefined();
      expect(typeof unsubscribe).toBe('function');
    });

    test('should call handler when event is published', () => {
      const handler = jest.fn();
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        { userId: 1, name: 'John' },
        expect.objectContaining({ name: 'user:created' })
      );
    });

    test('should unsubscribe when unsubscribe function is called', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.subscribe('user:created', handler);

      unsubscribe();

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler).not.toHaveBeenCalled();
    });

    test('should support multiple subscribers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('user:created', handler1);
      eventBus.subscribe('user:created', handler2);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    test('should handle different event types separately', () => {
      const createdHandler = jest.fn();
      const deletedHandler = jest.fn();

      eventBus.subscribe('user:created', createdHandler);
      eventBus.subscribe('user:deleted', deletedHandler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:deleted', { userId: 2 });

      expect(createdHandler).toHaveBeenCalledTimes(1);
      expect(deletedHandler).toHaveBeenCalledTimes(1);
      expect(createdHandler).toHaveBeenCalledWith({ userId: 1, name: 'John' }, expect.anything());
      expect(deletedHandler).toHaveBeenCalledWith({ userId: 2 }, expect.anything());
    });
  });

  describe('Once Subscription', () => {
    test('should call handler only once', () => {
      const handler = jest.fn();
      eventBus.once('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ userId: 1, name: 'John' }, expect.anything());
    });

    test('should return unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.once('user:created', handler);

      unsubscribe();

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Replay Last', () => {
    test('should replay last event to new subscribers', () => {
      const payload = { userId: 1, name: 'John' };
      eventBus.publish('user:created', payload);

      const handler = jest.fn();
      eventBus.subscribe('user:created', handler, { replayLast: true });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        payload,
        expect.objectContaining({ name: 'user:created' })
      );
    });

    test('should not replay if no previous events', () => {
      const handler = jest.fn();
      eventBus.subscribe('user:created', handler, { replayLast: true });

      expect(handler).not.toHaveBeenCalled();
    });

    test('should replay only the last event', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });
      eventBus.publish('user:created', { userId: 3, name: 'Bob' });

      const handler = jest.fn();
      eventBus.subscribe('user:created', handler, { replayLast: true });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ userId: 3, name: 'Bob' }, expect.anything());
    });
  });

  describe('Subscribe Any', () => {
    test('should receive all events', () => {
      const anyHandler = jest.fn();
      eventBus.subscribeAny(anyHandler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:deleted', { userId: 2 });

      expect(anyHandler).toHaveBeenCalledTimes(2);
    });

    test('should unsubscribe correctly', () => {
      const anyHandler = jest.fn();
      const unsubscribe = eventBus.subscribeAny(anyHandler);

      unsubscribe();

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(anyHandler).not.toHaveBeenCalled();
    });
  });

  describe('Event History', () => {
    test('should store events in history', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      const history = eventBus.getHistory();

      expect(history.length).toBe(2);
      expect(history[0].name).toBe('user:created');
      expect(history[1].name).toBe('user:created');
    });

    test('should respect max history limit', () => {
      const bus = new EventBusViewModel<TestEvents>();
      bus.init('test', 3);

      for (let i = 0; i < 5; i++) {
        bus.publish('user:created', { userId: i, name: `User${i}` });
      }

      const history = bus.getHistory();
      expect(history.length).toBe(3);
      expect(history[0].payload).toEqual({ userId: 2, name: 'User2' });
    });

    test('should filter history by event type', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:deleted', { userId: 2 });
      eventBus.publish('user:created', { userId: 3, name: 'Jane' });

      const createdHistory = eventBus.getHistory('user:created');

      expect(createdHistory.length).toBe(2);
      expect(createdHistory.every((e) => e.name === 'user:created')).toBe(true);
    });

    test('should limit history results', () => {
      for (let i = 0; i < 10; i++) {
        eventBus.publish('user:created', { userId: i, name: `User${i}` });
      }

      const limited = eventBus.getHistory(undefined, 5);

      expect(limited.length).toBe(5);
    });

    test('should clear history', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      eventBus.clearHistory();

      const history = eventBus.getHistory();
      expect(history.length).toBe(0);
    });

    test('should include timestamp in events', () => {
      const before = Date.now();
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      const after = Date.now();

      const history = eventBus.getHistory();

      expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(history[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Stats', () => {
    test('should return listener count', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('user:created', handler1);
      eventBus.subscribe('user:created', handler2);
      eventBus.subscribe('user:deleted', handler1);

      const stats = eventBus.stats();

      expect(stats.listeners).toBe(3);
      expect(stats.enabled).toBe(true);
    });

    test('should return any listener count', () => {
      const anyHandler1 = jest.fn();
      const anyHandler2 = jest.fn();

      eventBus.subscribeAny(anyHandler1);
      eventBus.subscribeAny(anyHandler2);

      const stats = eventBus.stats();

      expect(stats.anyListeners).toBe(2);
    });

    test('should update stats after unsubscribe', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.subscribe('user:created', handler);

      expect(eventBus.stats().listeners).toBe(1);

      unsubscribe();

      expect(eventBus.stats().listeners).toBe(0);
    });
  });

  describe('Event Structure', () => {
    test('should include event id', () => {
      const handler = jest.fn();
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      const event = handler.mock.calls[0][1];
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('number');
    });

    test('should increment event ids', () => {
      const handler = jest.fn();
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      const firstEvent = handler.mock.calls[0][1];
      const secondEvent = handler.mock.calls[1][1];

      expect(secondEvent.id).toBeGreaterThan(firstEvent.id);
    });

    test('should include event name', () => {
      const handler = jest.fn();
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      const event = handler.mock.calls[0][1];
      expect(event.name).toBe('user:created');
    });

    test('should include payload', () => {
      const handler = jest.fn();
      const payload = { userId: 1, name: 'John', extra: 'data' };
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', payload);

      const event = handler.mock.calls[0][1];
      expect(event.payload).toEqual(payload);
    });
  });

  describe('Error Handling', () => {
    test('should continue processing other handlers after one throws', () => {
      const handler1 = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const handler2 = jest.fn();

      eventBus.subscribe('user:created', handler1);
      eventBus.subscribe('user:created', handler2);

      expect(() => {
        eventBus.publish('user:created', { userId: 1, name: 'John' });
      }).not.toThrow();

      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});
