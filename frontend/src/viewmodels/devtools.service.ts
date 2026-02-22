/**
 * DevTools Service
 * Gathers and exposes comprehensive backend/frontend system information
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { EventBusViewModel } from './event-bus.viewmodel';
import { getLogger } from './logger';
import type {
  SystemInfo,
  MemoryInfo,
  ProcessInfo,
  NetworkInfo,
  DatabaseInfo,
  ConfigInfo,
  PerformanceMetrics,
  EnvironmentInfo,
  EventLogEntry,
  BackendBinding,
  WindowState,
  LogEntry,
  DevToolsData,
  DevToolsTabId,
} from '../models/devtools.model';

const logger = getLogger('devtools.service');

@Injectable({
  providedIn: 'root',
})
export class DevToolsService {
  private readonly eventBus = inject(EventBusViewModel<Record<string, unknown>>);

  // Signals for reactive state
  private readonly systemInfoSignal = signal<SystemInfo | null>(null);
  private readonly memoryInfoSignal = signal<MemoryInfo | null>(null);
  private readonly processInfoSignal = signal<ProcessInfo | null>(null);
  private readonly networkInfoSignal = signal<NetworkInfo | null>(null);
  private readonly databaseInfoSignal = signal<DatabaseInfo | null>(null);
  private readonly configInfoSignal = signal<ConfigInfo | null>(null);
  private readonly performanceSignal = signal<PerformanceMetrics | null>(null);
  private readonly environmentSignal = signal<EnvironmentInfo | null>(null);
  private readonly eventsSignal = signal<EventLogEntry[]>([]);
  private readonly bindingsSignal = signal<BackendBinding[]>([]);
  private readonly windowsSignal = signal<WindowState[]>([]);
  private readonly logsSignal = signal<LogEntry[]>([]);

  // Computed getters
  readonly systemInfo = computed(() => this.systemInfoSignal());
  readonly memoryInfo = computed(() => this.memoryInfoSignal());
  readonly processInfo = computed(() => this.processInfoSignal());
  readonly networkInfo = computed(() => this.networkInfoSignal());
  readonly databaseInfo = computed(() => this.databaseInfoSignal());
  readonly configInfo = computed(() => this.configInfoSignal());
  readonly performance = computed(() => this.performanceSignal());
  readonly environment = computed(() => this.environmentSignal());
  readonly events = computed(() => this.eventsSignal());
  readonly bindings = computed(() => this.bindingsSignal());
  readonly windows = computed(() => this.windowsSignal());
  readonly logs = computed(() => this.logsSignal());

  private refreshTimer: number | null = null;
  private eventCounter = 0;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize devtools and start data collection
   */
  init(): void {
    logger.info('DevTools initialized');
    this.gatherEnvironmentInfo();
    this.gatherAllData();
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh(intervalMs: number = 2000): void {
    this.stopAutoRefresh();
    this.refreshTimer = window.setInterval(() => {
      this.gatherDynamicData();
    }, intervalMs);
    logger.debug(`Auto-refresh started: ${intervalMs}ms`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      logger.debug('Auto-refresh stopped');
    }
  }

  /**
   * Gather all data (static + dynamic)
   */
  async gatherAllData(): Promise<void> {
    await Promise.all([
      this.gatherSystemInfo(),
      this.gatherConfigInfo(),
      this.gatherEnvironmentInfo(),
      this.gatherDynamicData(),
    ]);
  }

  /**
   * Gather dynamic data (changes frequently)
   */
  async gatherDynamicData(): Promise<void> {
    await Promise.all([
      this.gatherMemoryInfo(),
      this.gatherProcessInfo(),
      this.gatherNetworkInfo(),
      this.gatherDatabaseInfo(),
      this.gatherPerformanceMetrics(),
      this.gatherBindingsInfo(),
      this.gatherWindowsInfo(),
    ]);
  }

  /**
   * Gather system information from backend
   */
  private async gatherSystemInfo(): Promise<void> {
    try {
      const result = await this.callBackend<Record<string, unknown>>('get_system_info');
      if (result) {
        this.systemInfoSignal.set({
          hostname: String(result.hostname || 'unknown'),
          username: String(result.username || 'unknown'),
          os: String(result.os || 'unknown'),
          arch: String(result.arch || 'unknown'),
          cpu_count: Number(result.cpu_count || 0),
          rust_version: String(result.rust_version || 'unknown'),
          app_version: String(result.app_version || 'unknown'),
          build_time: String(result.build_time || 'unknown'),
        });
      }
    } catch (error) {
      logger.warn('Failed to gather system info', { error });
    }
  }

  /**
   * Gather memory information from backend
   */
  private async gatherMemoryInfo(): Promise<void> {
    try {
      const result = await this.callBackend<Record<string, unknown>>('get_memory_info');
      if (result) {
        this.memoryInfoSignal.set({
          total_mb: Number(result.total_mb || 0),
          used_mb: Number(result.used_mb || 0),
          free_mb: Number(result.free_mb || 0),
          percent_used: Number(result.percent_used || 0),
        });
      }
    } catch (error) {
      logger.warn('Failed to gather memory info', { error });
    }
  }

  /**
   * Gather process information from backend
   */
  private async gatherProcessInfo(): Promise<void> {
    try {
      const result = await this.callBackend<Record<string, unknown>>('get_process_info');
      if (result) {
        this.processInfoSignal.set({
          pid: Number(result.pid || 0),
          name: String(result.name || 'unknown'),
          cpu_percent: Number(result.cpu_percent || 0),
          memory_mb: Number(result.memory_mb || 0),
          threads: Number(result.threads || 0),
          uptime_seconds: Number(result.uptime_seconds || 0),
          start_time: String(result.start_time || ''),
        });
      }
    } catch (error) {
      logger.warn('Failed to gather process info', { error });
    }
  }

  /**
   * Gather network information from backend
   */
  private async gatherNetworkInfo(): Promise<void> {
    try {
      const result = await this.callBackend<Record<string, unknown>>('get_network_info');
      if (result) {
        const interfaces = (result.interfaces as Record<string, unknown>[]) || [];
        this.networkInfoSignal.set({
          interfaces: interfaces.map((iface) => ({
            name: String(iface.name || ''),
            ip: String(iface.ip || ''),
            mac: String(iface.mac || ''),
            is_up: Boolean(iface.is_up),
          })),
          default_port: Number(result.default_port || 0),
          is_webui_bound: Boolean(result.is_webui_bound),
        });
      }
    } catch (error) {
      logger.warn('Failed to gather network info', { error });
    }
  }

  /**
   * Gather database information from backend
   */
  private async gatherDatabaseInfo(): Promise<void> {
    try {
      const result = await this.callBackend<Record<string, unknown>>('get_database_info');
      if (result) {
        const tables = (result.tables as Record<string, unknown>[]) || [];
        this.databaseInfoSignal.set({
          path: String(result.path || ''),
          size_kb: Number(result.size_kb || 0),
          table_count: Number(result.table_count || 0),
          tables: tables.map((table) => ({
            name: String(table.name || ''),
            row_count: Number(table.row_count || 0),
            size_kb: Number(table.size_kb || 0),
            columns: ((table.columns as Record<string, unknown>[]) || []).map((col) => ({
              name: String(col.name || ''),
              type: String(col.type || ''),
              nullable: Boolean(col.nullable),
              is_primary_key: Boolean(col.is_primary_key),
            })),
          })),
          connection_pool_size: Number(result.connection_pool_size || 0),
          active_connections: Number(result.active_connections || 0),
        });
      }
    } catch (error) {
      logger.warn('Failed to gather database info', { error });
    }
  }

  /**
   * Gather config information from backend
   */
  private async gatherConfigInfo(): Promise<void> {
    try {
      const result = await this.callBackend<Record<string, unknown>>('get_config_info');
      if (result) {
        this.configInfoSignal.set({
          app_name: String(result.app_name || ''),
          version: String(result.version || ''),
          log_level: String(result.log_level || ''),
          log_file: String(result.log_file || ''),
          database_path: String(result.database_path || ''),
          port: Number(result.port || 0),
          debug_mode: Boolean(result.debug_mode),
          features: (result.features as string[]) || [],
        });
      }
    } catch (error) {
      logger.warn('Failed to gather config info', { error });
    }
  }

  /**
   * Gather performance metrics from frontend
   */
  private gatherPerformanceMetrics(): void {
    try {
      // Get performance data from Performance API
      const memory = (window as unknown as { memory?: { jsHeapSizeLimit: number; totalJSHeapSize: number; usedJSHeapSize: number } }).memory;
      
      // Count DOM nodes
      const domNodes = document.getElementsByTagName('*').length;
      
      // Count event listeners (approximate via getEventListeners if available)
      let eventListeners = 0;
      try {
        // This is a rough estimate - actual count requires devtools protocol
        eventListeners = document.querySelectorAll('[onclick], [onchange], [onsubmit]').length * 2 + 50;
      } catch {
        eventListeners = 0;
      }

      this.performanceSignal.set({
        fps: this.calculateFPS(),
        dom_nodes: domNodes,
        js_heap_size_mb: memory ? Math.round(memory.jsHeapSizeLimit / 1048576) : 0,
        js_heap_used_mb: memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0,
        event_listeners: eventListeners,
        open_windows: this.windowsSignal().length,
        active_timers: 0, // Would need tracking
        pending_requests: 0, // Would need tracking
      });
    } catch (error) {
      logger.warn('Failed to gather performance metrics', { error });
    }
  }

  /**
   * Calculate approximate FPS
   */
  private calculateFPS(): number {
    // Simple FPS calculation using requestAnimationFrame
    let lastTime = performance.now();
    let frames = 0;
    let fps = 60;

    const measure = (currentTime: number) => {
      frames++;
      if (currentTime - lastTime >= 1000) {
        fps = frames;
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
    
    return fps;
  }

  /**
   * Gather environment information from browser
   */
  private gatherEnvironmentInfo(): void {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      let webglRenderer: string | undefined;
      if (gl && 'getExtension' in gl) {
        const webglGl = gl as WebGLRenderingContext;
        const debugInfo = webglGl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglRenderer = webglGl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL) as string;
        }
      }

      this.environmentSignal.set({
        angular_version: '19.2.18',
        production: false, // Will be set by build
        browser: navigator.userAgent,
        user_agent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen_resolution: `${screen.width}x${screen.height}`,
        color_depth: screen.colorDepth,
        device_pixel_ratio: window.devicePixelRatio,
        cookies_enabled: navigator.cookieEnabled,
        local_storage_enabled: typeof localStorage !== 'undefined',
        session_storage_enabled: typeof sessionStorage !== 'undefined',
        webgl_enabled: !!gl,
        webgl_renderer: webglRenderer,
      });
    } catch (error) {
      logger.warn('Failed to gather environment info', { error });
    }
  }

  /**
   * Gather backend bindings info
   */
  private gatherBindingsInfo(): void {
    const bindings: BackendBinding[] = [
      'get_users',
      'create_user',
      'update_user',
      'delete_user',
      'get_system_info',
      'get_memory_info',
      'get_process_info',
      'get_network_info',
      'get_database_info',
      'get_config_info',
      'get_logs',
    ].map((name) => {
      const fn = (window as unknown as Record<string, unknown>)[name];
      return {
        name,
        bound: typeof fn === 'function',
        call_count: 0,
      };
    });
    this.bindingsSignal.set(bindings);
  }

  /**
   * Gather window state info
   */
  private gatherWindowsInfo(): void {
    // Get window info from windowState or winbox service
    const winboxWindows = (window as unknown as { WinBox?: { windows?: WindowState[] } }).WinBox?.windows || [];
    this.windowsSignal.set(winboxWindows as WindowState[]);
  }

  /**
   * Add event to event log
   */
  addEvent(type: 'info' | 'warn' | 'error' | 'debug' | 'system', source: string, message: string, data?: Record<string, unknown>): void {
    const entry: EventLogEntry = {
      id: ++this.eventCounter,
      timestamp: new Date().toISOString(),
      type,
      source,
      message,
      data,
    };
    
    const currentEvents = this.eventsSignal();
    this.eventsSignal.set([entry, ...currentEvents].slice(0, 100)); // Keep last 100 events
    
    this.eventBus.publish('devtools:event-added', entry);
  }

  /**
   * Call backend function with error handling
   */
  private async callBackend<T>(functionName: string, ...args: unknown[]): Promise<T | null> {
    return new Promise((resolve) => {
      const responseEventName = `${functionName}_response`;
      const timeoutMs = 5000;

      const handler = (event: Event) => {
        clearTimeout(timeoutId);
        window.removeEventListener(responseEventName, handler as EventListener);

        const customEvent = event as CustomEvent;
        const response = customEvent.detail?.response as { data?: T; error?: { message?: string } } | undefined;

        if (response?.data !== undefined) {
          resolve(response.data);
        } else {
          logger.debug(`Backend call returned no data: ${functionName}`);
          resolve(null);
        }
      };

      const timeoutId = setTimeout(() => {
        window.removeEventListener(responseEventName, handler as EventListener);
        logger.debug(`Backend call timeout: ${functionName}`);
        resolve(null);
      }, timeoutMs);

      window.addEventListener(responseEventName, handler as EventListener, { once: true });

      try {
        const backendFn = (window as unknown as Record<string, unknown>)[functionName];
        if (typeof backendFn === 'function') {
          backendFn(...args);
        } else {
          clearTimeout(timeoutId);
          window.removeEventListener(responseEventName, handler as EventListener);
          resolve(null);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        window.removeEventListener(responseEventName, handler as EventListener);
        logger.debug(`Backend call failed: ${functionName}`, { error });
        resolve(null);
      }
    });
  }

  /**
   * Setup event listeners for system events
   */
  private setupEventListeners(): void {
    // Listen for WebUI status events
    window.addEventListener('webui:status', ((event: CustomEvent) => {
      this.addEvent('system', 'webui:status', 'WebUI status changed', event.detail);
    }) as EventListener);

    // Listen for error events
    window.addEventListener('error', ((event: ErrorEvent) => {
      this.addEvent('error', 'window:error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }) as EventListener);

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', ((event: PromiseRejectionEvent) => {
      this.addEvent('error', 'window:unhandledrejection', 'Unhandled promise rejection', {
        reason: event.reason?.toString() || 'Unknown',
      });
    }) as EventListener);
  }

  /**
   * Get full devtools data snapshot
   */
  getSnapshot(): DevToolsData {
    return {
      system: this.systemInfoSignal() || {} as SystemInfo,
      memory: this.memoryInfoSignal() || {} as MemoryInfo,
      process: this.processInfoSignal() || {} as ProcessInfo,
      network: this.networkInfoSignal() || {} as NetworkInfo,
      database: this.databaseInfoSignal() || {} as DatabaseInfo,
      config: this.configInfoSignal() || {} as ConfigInfo,
      performance: this.performanceSignal() || {} as PerformanceMetrics,
      environment: this.environmentSignal() || {} as EnvironmentInfo,
      events: this.eventsSignal(),
      bindings: this.bindingsSignal(),
      windows: this.windowsSignal(),
      logs: this.logsSignal(),
    };
  }

  /**
   * Clear events log
   */
  clearEvents(): void {
    this.eventsSignal.set([]);
    this.addEvent('info', 'devtools', 'Events log cleared');
  }

  /**
   * Export data as JSON
   */
  exportData(): string {
    return JSON.stringify(this.getSnapshot(), null, 2);
  }
}
