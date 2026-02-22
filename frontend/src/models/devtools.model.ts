/**
 * DevTools Data Models
 * Comprehensive system information exposure
 */

// ==================== System Info ====================
export interface SystemInfo {
  hostname: string;
  username: string;
  os: string;
  arch: string;
  cpu_count: number;
  rust_version: string;
  app_version: string;
  build_time: string;
}

// ==================== Memory Info ====================
export interface MemoryInfo {
  total_mb: number;
  used_mb: number;
  free_mb: number;
  percent_used: number;
}

// ==================== Process Info ====================
export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_mb: number;
  threads: number;
  uptime_seconds: number;
  start_time: string;
}

// ==================== Network Info ====================
export interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  is_up: boolean;
}

export interface NetworkInfo {
  interfaces: NetworkInterface[];
  default_port: number;
  is_webui_bound: boolean;
}

// ==================== Database Info ====================
export interface DatabaseInfo {
  path: string;
  size_kb: number;
  table_count: number;
  tables: TableInfo[];
  connection_pool_size: number;
  active_connections: number;
}

export interface TableInfo {
  name: string;
  row_count: number;
  size_kb: number;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  is_primary_key: boolean;
}

// ==================== Config Info ====================
export interface ConfigInfo {
  app_name: string;
  version: string;
  log_level: string;
  log_file: string;
  database_path: string;
  port: number;
  debug_mode: boolean;
  features: string[];
}

// ==================== Performance Metrics ====================
export interface PerformanceMetrics {
  fps: number;
  dom_nodes: number;
  js_heap_size_mb: number;
  js_heap_used_mb: number;
  event_listeners: number;
  open_windows: number;
  active_timers: number;
  pending_requests: number;
}

// ==================== Event Log Entry ====================
export interface EventLogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'debug' | 'system';
  source: string;
  message: string;
  data?: Record<string, unknown>;
}

// ==================== Backend Function Binding ====================
export interface BackendBinding {
  name: string;
  bound: boolean;
  call_count: number;
  last_called?: string;
  avg_response_ms?: number;
}

// ==================== Window State ====================
export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_minimized: boolean;
  is_maximized: boolean;
  is_focused: boolean;
  created_at: string;
}

// ==================== DevTools Tab ====================
export type DevToolsTabId =
  | 'overview'
  | 'system'
  | 'memory'
  | 'process'
  | 'network'
  | 'database'
  | 'config'
  | 'performance'
  | 'events'
  | 'bindings'
  | 'windows'
  | 'about';

export interface DevToolsTab {
  id: DevToolsTabId;
  label: string;
  icon: string;
  badge?: number;
}

// ==================== DevTools State ====================
export interface DevToolsState {
  isOpen: boolean;
  activeTab: DevToolsTabId;
  autoRefresh: boolean;
  refreshInterval: number;
  lastUpdated: string;
}

// ==================== Log Entry ====================
export interface LogEntry {
  level: string;
  timestamp: string;
  target: string;
  message: string;
  file?: string;
  line?: number;
}

// ==================== Environment Info ====================
export interface EnvironmentInfo {
  angular_version: string;
  production: boolean;
  browser: string;
  user_agent: string;
  language: string;
  platform: string;
  screen_resolution: string;
  color_depth: number;
  device_pixel_ratio: number;
  cookies_enabled: boolean;
  local_storage_enabled: boolean;
  session_storage_enabled: boolean;
  webgl_enabled: boolean;
  webgl_renderer?: string;
}

// ==================== Combined DevTools Data ====================
export interface DevToolsData {
  system: SystemInfo;
  memory: MemoryInfo;
  process: ProcessInfo;
  network: NetworkInfo;
  database: DatabaseInfo;
  config: ConfigInfo;
  performance: PerformanceMetrics;
  environment: EnvironmentInfo;
  events: EventLogEntry[];
  bindings: BackendBinding[];
  windows: WindowState[];
  logs: LogEntry[];
}
