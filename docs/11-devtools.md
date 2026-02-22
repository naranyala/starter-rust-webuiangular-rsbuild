# DevTools Guide

This document describes the DevTools panel, a comprehensive system diagnostics tool built into the application.

## Overview

The DevTools panel provides real-time visibility into both backend and frontend system metrics. It is accessible from the bottom panel and offers 11 specialized diagnostic views.

## Accessing DevTools

1. Click the bottom panel toggle to expand the status bar
2. Click the DevTools tab (wrench icon) in the bottom panel
3. The panel expands to 50% of screen height when DevTools is active

## Features

### Header Controls

- **Refresh Button**: Manually refresh all data
- **Auto-Refresh Toggle**: Enable/disable automatic data refresh (2-second interval)
- **Export Button**: Download current data as JSON

### Tabs and Panels

The DevTools interface includes 11 tabs:

#### 1. Overview
Quick summary dashboard showing:
- System information (OS, hostname, CPU cores)
- Process status (PID, CPU%, memory)
- Memory usage (used, free, percentage)
- Network status (port, interfaces)
- Performance metrics (DOM nodes, heap usage)
- Event statistics (total, errors, warnings)

#### 2. System
Detailed system information:
- Hostname
- Username
- Operating system and architecture
- CPU core count
- Rust version
- Application version
- Build time

#### 3. Memory
Memory visualization and statistics:
- Visual memory usage bar
- Total memory (MB)
- Used memory (MB)
- Free memory (MB)
- Usage percentage

#### 4. Process
Process-level details:
- Process ID (PID)
- Process name
- CPU usage percentage
- Memory usage (MB)
- Thread count
- Uptime (formatted)
- Start time

#### 5. Network
Network interface information:
- Default port
- WebUI bound status
- Network interfaces list:
  - Interface name
  - IP address
  - MAC address
  - Status (up/down)

#### 6. Database
Database status and schema:
- Database path
- Database size (KB)
- Table count
- Table details:
  - Table name
  - Row count
  - Size (KB)
  - Columns with types
- Connection pool size
- Active connections

#### 7. Config
Application configuration:
- Application name
- Version
- Log level
- Log file path
- Database path
- Port
- Debug mode status
- Enabled features

#### 8. Performance
Frontend performance metrics:
- Frames per second (FPS)
- DOM node count
- JavaScript heap size (MB)
- JavaScript heap used (MB)
- Event listener count
- Open windows count
- Environment details:
  - Angular version
  - Browser information
  - Screen resolution
  - Device pixel ratio
  - WebGL status and renderer

#### 9. Events
Event log with filtering:
- Event list with timestamps
- Event types: info, warn, error, debug, system
- Event source identification
- Event message and data
- Filter options: All, Errors, Warnings, Info
- Clear events button
- Expandable event details

#### 10. Bindings
Backend function binding status:
- Function name list
- Binding status (bound/not bound)
- Call count tracking
- Last called timestamp

#### 11. Windows
Open window management:
- Window list with titles
- Window state indicators:
  - Minimized status
  - Maximized status
  - Focused status
- Window position (x, y)
- Window dimensions (width, height)
- Window ID

## Architecture

### Service Layer (devtools.service.ts)

The DevTools service is responsible for:

- Gathering system information from backend endpoints
- Collecting frontend performance metrics
- Managing event logging and history
- Providing auto-refresh functionality
- Exposing reactive signals for UI consumption

#### Key Methods

```typescript
// Initialize service
init(): void

// Start auto-refresh
startAutoRefresh(intervalMs?: number): void

// Stop auto-refresh
stopAutoRefresh(): void

// Gather all data
gatherAllData(): Promise<void>

// Gather dynamic data (changes frequently)
gatherDynamicData(): Promise<void>

// Add event to log
addEvent(type, source, message, data?): void

// Export data as JSON
exportData(): string

// Clear events
clearEvents(): void
```

### Backend Endpoints

The following backend endpoints support DevTools:

| Endpoint | Description |
|----------|-------------|
| get_system_info | Hostname, username, OS, CPU count |
| get_memory_info | Total, used, free memory |
| get_process_info | PID, CPU%, memory, threads, uptime |
| get_network_info | Network interfaces |
| get_database_info | Database path, size, tables |
| get_config_info | Application configuration |
| get_logs | Application logs |

### Component Layer

#### DevToolsComponent

Main container component with:
- Tab navigation
- Header controls
- Content area with switch statement for panels

#### Panel Components

Each tab has a dedicated component:

- DevToolsOverviewComponent
- DevToolsSystemComponent
- DevToolsMemoryComponent
- DevToolsProcessComponent
- DevToolsNetworkComponent
- DevToolsDatabaseComponent
- DevToolsConfigComponent
- DevToolsPerformanceComponent
- DevToolsEventsComponent
- DevToolsBindingsComponent
- DevToolsWindowsComponent
- DevToolsAboutComponent

## Data Models

### SystemInfo

```typescript
interface SystemInfo {
  hostname: string;
  username: string;
  os: string;
  arch: string;
  cpu_count: number;
  rust_version: string;
  app_version: string;
  build_time: string;
}
```

### MemoryInfo

```typescript
interface MemoryInfo {
  total_mb: number;
  used_mb: number;
  free_mb: number;
  percent_used: number;
}
```

### ProcessInfo

```typescript
interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_mb: number;
  threads: number;
  uptime_seconds: number;
  start_time: string;
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  fps: number;
  dom_nodes: number;
  js_heap_size_mb: number;
  js_heap_used_mb: number;
  event_listeners: number;
  open_windows: number;
}
```

### EventLogEntry

```typescript
interface EventLogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'debug' | 'system';
  source: string;
  message: string;
  data?: Record<string, unknown>;
}
```

## Usage Examples

### Accessing DevTools Data Programmatically

```typescript
import { DevToolsService } from '../viewmodels/devtools.service';

// Inject service
constructor(private devTools: DevToolsService) {}

// Get snapshot of all data
const snapshot = this.devTools.getSnapshot();

// Access specific data via signals
const systemInfo = this.devTools.systemInfo();
const memoryInfo = this.devTools.memoryInfo();

// Subscribe to changes
const unsubscribe = this.devTools.events.subscribe(events => {
  console.log('New events:', events);
});
```

### Adding Custom Events

```typescript
// Log custom event
this.devTools.addEvent(
  'info',
  'my-component',
  'Custom action performed',
  { actionId: 123, timestamp: Date.now() }
);
```

### Exporting Data

```typescript
// Export current data
const jsonData = this.devTools.exportData();

// Download as file
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'devtools-export.json';
a.click();
```

## Styling

The DevTools panel uses a dark theme inspired by browser developer tools:

- Background: #1e1e1e
- Text: #d4d4d4
- Accent: #007acc
- Success: #4ade80
- Warning: #fbbf24
- Error: #ef4444

### CSS Classes

Key CSS classes for customization:

- .devtools-container: Main container
- .devtools-header: Header bar
- .devtools-tabs: Tab navigation
- .devtools-content: Content area
- .devtools-panel: Individual panel

## Performance Considerations

### Auto-Refresh

- Default interval: 2000ms (2 seconds)
- Can be adjusted via startAutoRefresh(intervalMs)
- Disable when panel is not visible to save resources

### Data Collection

- Static data (system info, config) gathered once on init
- Dynamic data (memory, process, performance) gathered on refresh
- Event log limited to 100 entries

### Memory Usage

- DevTools service uses Angular Signals for efficient change detection
- Old events are automatically pruned
- Performance metrics use browser Performance API

## Troubleshooting

### Panel Not Expanding

Ensure the bottom panel is not collapsed:
```typescript
// Check bottomCollapsed signal
if (this.bottomCollapsed()) {
  this.toggleBottom();
}
```

### Data Not Refreshing

1. Check auto-refresh toggle status
2. Verify backend endpoints are bound
3. Check browser console for errors
4. Manually click refresh button

### Missing Backend Data

1. Verify backend endpoints are registered
2. Check sysinfo_handlers.rs for endpoint implementations
3. Ensure event listeners are attached
4. Check network tab for failed requests

## Future Enhancements

Potential improvements for DevTools:

1. **Real-time Charts**: Graph CPU and memory usage over time
2. **Performance Profiling**: Function call timing and memory allocation
3. **Interactive Console**: REPL for executing backend commands
4. **Settings Management**: UI for toggling feature flags
5. **Custom Queries**: Database query interface
6. **Log Streaming**: Real-time log tailing
7. **Alert System**: Configurable thresholds and notifications

## Related Documentation

- [Architecture](02-architecture.md) - DevTools architecture overview
- [Communication](04-communication.md) - Frontend-backend communication
- [Testing](10-testing.md) - Testing DevTools components
