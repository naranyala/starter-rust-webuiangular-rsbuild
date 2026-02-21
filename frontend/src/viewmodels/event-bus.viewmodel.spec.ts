// Frontend unit tests for EventBusViewModel
// Tests the event bus pub/sub pattern implementation

import { BusEvent, EventBusViewModel, SubscribeOptions } from './event-bus.viewmodel';

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
    it('should initialize with namespace and max history', () => {
      const bus = new EventBusViewModel<TestEvents>();
      bus.init('myapp', 50);

      expect(bus.isEnabled()).toBe(true);
    });

    it('should be enabled by default', () => {
      expect(eventBus.isEnabled()).toBe(true);
    });

    it('should be disabled when setEnabled(false) is called', () => {
      eventBus.setEnabled(false);
      expect(eventBus.isEnabled()).toBe(false);
    });
  });

  describe('Subscription', () => {
    it('should subscribe to events', () => {
      const handler = jasmine.createSpy('handler');
      const unsubscribe = eventBus.subscribe('user:created', handler);

      expect(unsubscribe).toBeDefined();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call handler when event is published', () => {
      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        { userId: 1, name: 'John' },
        jasmine.objectContaining({ name: 'user:created' })
      );
    });

    it('should unsubscribe when unsubscribe function is called', () => {
      const handler = jasmine.createSpy('handler');
      const unsubscribe = eventBus.subscribe('user:created', handler);

      unsubscribe();

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      const handler1 = jasmine.createSpy('handler1');
      const handler2 = jasmine.createSpy('handler2');

      eventBus.subscribe('user:created', handler1);
      eventBus.subscribe('user:created', handler2);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should handle different event types separately', () => {
      const createdHandler = jasmine.createSpy('createdHandler');
      const deletedHandler = jasmine.createSpy('deletedHandler');

      eventBus.subscribe('user:created', createdHandler);
      eventBus.subscribe('user:deleted', deletedHandler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:deleted', { userId: 2 });

      expect(createdHandler).toHaveBeenCalledTimes(1);
      expect(deletedHandler).toHaveBeenCalledTimes(1);
      expect(createdHandler).toHaveBeenCalledWith({ userId: 1, name: 'John' }, jasmine.anything());
      expect(deletedHandler).toHaveBeenCalledWith({ userId: 2 }, jasmine.anything());
    });
  });

  describe('Once Subscription', () => {
    it('should call handler only once', () => {
      const handler = jasmine.createSpy('handler');
      eventBus.once('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ userId: 1, name: 'John' }, jasmine.anything());
    });

    it('should return unsubscribe function', () => {
      const handler = jasmine.createSpy('handler');
      const unsubscribe = eventBus.once('user:created', handler);

      unsubscribe();

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Replay Last', () => {
    it('should replay last event to new subscribers', () => {
      const payload = { userId: 1, name: 'John' };
      eventBus.publish('user:created', payload);

      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler, { replayLast: true });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        payload,
        jasmine.objectContaining({ name: 'user:created' })
      );
    });

    it('should not replay if no previous events', () => {
      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler, { replayLast: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should replay only the last event', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });
      eventBus.publish('user:created', { userId: 3, name: 'Bob' });

      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler, { replayLast: true });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ userId: 3, name: 'Bob' }, jasmine.anything());
    });
  });

  describe('Subscribe Any', () => {
    it('should receive all events', () => {
      const anyHandler = jasmine.createSpy('anyHandler');
      eventBus.subscribeAny(anyHandler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:deleted', { userId: 2 });

      expect(anyHandler).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe correctly', () => {
      const anyHandler = jasmine.createSpy('anyHandler');
      const unsubscribe = eventBus.subscribeAny(anyHandler);

      unsubscribe();

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      expect(anyHandler).not.toHaveBeenCalled();
    });
  });

  describe('Event History', () => {
    it('should store events in history', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      const history = eventBus.getHistory();

      expect(history.length).toBe(2);
      expect(history[0].name).toBe('user:created');
      expect(history[1].name).toBe('user:created');
    });

    it('should respect max history limit', () => {
      const bus = new EventBusViewModel<TestEvents>();
      bus.init('test', 3);

      for (let i = 0; i < 5; i++) {
        bus.publish('user:created', { userId: i, name: `User${i}` });
      }

      const history = bus.getHistory();
      expect(history.length).toBe(3);
      expect(history[0].payload).toEqual({ userId: 2, name: 'User2' });
    });

    it('should filter history by event type', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:deleted', { userId: 2 });
      eventBus.publish('user:created', { userId: 3, name: 'Jane' });

      const createdHistory = eventBus.getHistory('user:created');

      expect(createdHistory.length).toBe(2);
      expect(createdHistory.every((e) => e.name === 'user:created')).toBe(true);
    });

    it('should limit history results', () => {
      for (let i = 0; i < 10; i++) {
        eventBus.publish('user:created', { userId: i, name: `User${i}` });
      }

      const limited = eventBus.getHistory(undefined, 5);

      expect(limited.length).toBe(5);
    });

    it('should clear history', () => {
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      eventBus.clearHistory();

      const history = eventBus.getHistory();
      expect(history.length).toBe(0);
    });

    it('should include timestamp in events', () => {
      const before = Date.now();
      eventBus.publish('user:created', { userId: 1, name: 'John' });
      const after = Date.now();

      const history = eventBus.getHistory();

      expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(history[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Stats', () => {
    it('should return listener count', () => {
      const handler1 = jasmine.createSpy('handler1');
      const handler2 = jasmine.createSpy('handler2');

      eventBus.subscribe('user:created', handler1);
      eventBus.subscribe('user:created', handler2);
      eventBus.subscribe('user:deleted', handler1);

      const stats = eventBus.getStats();

      expect(stats.listeners).toBe(3);
      expect(stats.enabled).toBe(true);
    });

    it('should return any listener count', () => {
      const anyHandler1 = jasmine.createSpy('anyHandler1');
      const anyHandler2 = jasmine.createSpy('anyHandler2');

      eventBus.subscribeAny(anyHandler1);
      eventBus.subscribeAny(anyHandler2);

      const stats = eventBus.getStats();

      expect(stats.anyListeners).toBe(2);
    });

    it('should update stats after unsubscribe', () => {
      const handler = jasmine.createSpy('handler');
      const unsubscribe = eventBus.subscribe('user:created', handler);

      expect(eventBus.getStats().listeners).toBe(1);

      unsubscribe();

      expect(eventBus.getStats().listeners).toBe(0);
    });
  });

  describe('Event Structure', () => {
    it('should include event id', () => {
      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      const event = handler.calls.mostRecent().args[1] as BusEvent;
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('number');
    });

    it('should increment event ids', () => {
      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });
      eventBus.publish('user:created', { userId: 2, name: 'Jane' });

      const firstEvent = handler.calls.first().args[1] as BusEvent;
      const secondEvent = handler.calls.mostRecent().args[1] as BusEvent;

      expect(secondEvent.id).toBeGreaterThan(firstEvent.id);
    });

    it('should include event name', () => {
      const handler = jasmine.createSpy('handler');
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', { userId: 1, name: 'John' });

      const event = handler.calls.mostRecent().args[1] as BusEvent;
      expect(event.name).toBe('user:created');
    });

    it('should include payload', () => {
      const handler = jasmine.createSpy('handler');
      const payload = { userId: 1, name: 'John', extra: 'data' };
      eventBus.subscribe('user:created', handler);

      eventBus.publish('user:created', payload);

      const event = handler.calls.mostRecent().args[1] as BusEvent;
      expect(event.payload).toEqual(payload);
    });
  });

  describe('Error Handling', () => {
    it('should continue processing other handlers after one throws', () => {
      const handler1 = jasmine.createSpy('handler1').and.throwError('Error');
      const handler2 = jasmine.createSpy('handler2');

      eventBus.subscribe('user:created', handler1);
      eventBus.subscribe('user:created', handler2);

      expect(() => {
        eventBus.publish('user:created', { userId: 1, name: 'John' });
      }).not.toThrow();

      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});
