import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { EventBusViewModel } from './event-bus.viewmodel';
import { getLogger } from './logger';

export interface ConnectionStats {
  state: string;
  connected: boolean;
  lastError: string | null;
  port: string | null;
  latency: number;
  uptime: number;
  reconnects: number;
  pingSuccess: number;
  totalCalls: number;
  successfulCalls: number;
}

@Injectable({ providedIn: 'root' })
export class ConnectionMonitorService implements OnDestroy {
  private readonly logger = getLogger('connection-monitor');
  private readonly eventBus: EventBusViewModel<Record<string, unknown>>;
  private connectionUnsubscribe: (() => void) | null = null;
  private portUnsubscribe: (() => void) | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  readonly state = signal<string>('connecting');
  readonly connected = signal<boolean>(false);
  readonly port = signal<string | null>(null);
  readonly latency = signal<number>(0);
  readonly uptime = signal<number>(0);
  readonly reconnects = signal<number>(0);
  readonly pingSuccess = signal<number>(100);
  readonly totalCalls = signal<number>(0);
  readonly successfulCalls = signal<number>(0);
  readonly lastError = signal<string | null>(null);
  readonly detailsExpanded = signal<boolean>(false);

  readonly stats = computed<ConnectionStats>(() => ({
    state: this.state(),
    connected: this.connected(),
    lastError: this.lastError(),
    port: this.port(),
    latency: this.latency(),
    uptime: this.uptime(),
    reconnects: this.reconnects(),
    pingSuccess: this.pingSuccess(),
    totalCalls: this.totalCalls(),
    successfulCalls: this.successfulCalls(),
  }));

  constructor(eventBus: EventBusViewModel<Record<string, unknown>>) {
    this.eventBus = eventBus;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.connectionUnsubscribe = this.eventBus.subscribe('connection:state', (payload) => {
      const data = payload as { state: string; connected: boolean };
      this.state.set(data.state);
      this.connected.set(data.connected);

      if (data.connected) {
        this.reconnects.update((r) => r + 1);
      }
    });

    this.portUnsubscribe = this.eventBus.subscribe('webui:port', (payload) => {
      const data = payload as { port: number };
      this.port.set(String(data.port));
      this.startPingMonitor();
    });
  }

  private startPingMonitor(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    const startTime = Date.now();
    this.pingInterval = setInterval(() => {
      this.uptime.set(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }

  recordCall(success: boolean): void {
    this.totalCalls.update((c) => c + 1);
    if (success) {
      this.successfulCalls.update((c) => c + 1);
    }
    this.pingSuccess.update(() => {
      const total = this.totalCalls();
      return total > 0 ? Math.round((this.successfulCalls() / total) * 100) : 100;
    });
  }

  recordError(error: string): void {
    this.lastError.set(error);
  }

  toggleDetails(): void {
    this.detailsExpanded.update((v) => !v);
  }

  ngOnDestroy(): void {
    this.connectionUnsubscribe?.();
    this.portUnsubscribe?.();
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }
}
