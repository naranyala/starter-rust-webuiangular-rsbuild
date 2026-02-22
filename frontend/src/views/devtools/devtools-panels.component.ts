/**
 * DevTools Sub-components
 * Individual panels for each devtools tab
 */

import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DevToolsService } from '../../viewmodels/devtools.service';

// ==================== Overview Component ====================
@Component({
  selector: 'app-devtools-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <div class="panel-grid">
        <div class="info-group">
          <h3 class="info-group__title">🖥️ System</h3>
          @if (systemInfo()) {
            <div class="info-row">
              <span class="info-row__label">OS:</span>
              <span class="info-row__value">{{ systemInfo()?.os }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Hostname:</span>
              <span class="info-row__value">{{ systemInfo()?.hostname }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">CPU Cores:</span>
              <span class="info-row__value">{{ systemInfo()?.cpu_count }}</span>
            </div>
          } @else {
            <div class="info-row__empty">Loading...</div>
          }
        </div>

        <div class="info-group">
          <h3 class="info-group__title">⚙️ Process</h3>
          @if (processInfo()) {
            <div class="info-row">
              <span class="info-row__label">PID:</span>
              <span class="info-row__value">{{ processInfo()?.pid }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">CPU:</span>
              <span class="info-row__value">{{ processInfo()?.cpu_percent }}%</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Memory:</span>
              <span class="info-row__value">{{ processInfo()?.memory_mb }} MB</span>
            </div>
          } @else {
            <div class="info-row__empty">Loading...</div>
          }
        </div>

        <div class="info-group">
          <h3 class="info-group__title">🧠 Memory</h3>
          @if (memoryInfo()) {
            <div class="info-row">
              <span class="info-row__label">Used:</span>
              <span class="info-row__value">{{ memoryInfo()?.used_mb }} / {{ memoryInfo()?.total_mb }} MB</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Usage:</span>
              <span class="info-row__value">{{ memoryInfo()?.percent_used }}%</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Free:</span>
              <span class="info-row__value">{{ memoryInfo()?.free_mb }} MB</span>
            </div>
          } @else {
            <div class="info-row__empty">Loading...</div>
          }
        </div>

        <div class="info-group">
          <h3 class="info-group__title">🌐 Network</h3>
          @if (networkInfo()) {
            <div class="info-row">
              <span class="info-row__label">Port:</span>
              <span class="info-row__value">{{ networkInfo()?.default_port }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Bound:</span>
              <span class="info-row__value" [class.status-ok]="networkInfo()?.is_webui_bound">{{ networkInfo()?.is_webui_bound ? 'Yes' : 'No' }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Interfaces:</span>
              <span class="info-row__value">{{ networkInfo()?.interfaces?.length ?? 0 }}</span>
            </div>
          } @else {
            <div class="info-row__empty">Loading...</div>
          }
        </div>

        <div class="info-group">
          <h3 class="info-group__title">📊 Performance</h3>
          @if (performance()) {
            <div class="info-row">
              <span class="info-row__label">DOM Nodes:</span>
              <span class="info-row__value">{{ performance()?.dom_nodes }}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Heap Used:</span>
              <span class="info-row__value">{{ performance()?.js_heap_used_mb }} MB</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Windows:</span>
              <span class="info-row__value">{{ performance()?.open_windows }}</span>
            </div>
          } @else {
            <div class="info-row__empty">Loading...</div>
          }
        </div>

        <div class="info-group">
          <h3 class="info-group__title">📜 Events</h3>
          <div class="info-row">
            <span class="info-row__label">Total:</span>
            <span class="info-row__value">{{ events().length }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">Errors:</span>
            <span class="info-row__value" [class.status-error]="errorCount() > 0">{{ errorCount() }}</span>
          </div>
          <div class="info-row">
            <span class="info-row__label">Warnings:</span>
            <span class="info-row__value" [class.status-warn]="warnCount() > 0">{{ warnCount() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    .info-group {
      background: #252526;
      border-radius: 6px;
      padding: 12px;
    }
    .info-group__title {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #3c3c3c;
      font-size: 11px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-row__label { color: #888; }
    .info-row__value { color: #d4d4d4; font-weight: 500; }
    .info-row__empty { color: #666; font-style: italic; }
    .status-ok { color: #4ade80; }
    .status-warn { color: #fbbf24; }
    .status-error { color: #ef4444; }
  `],
})
export class DevToolsOverviewComponent implements OnInit {
  private readonly devToolsService = inject(DevToolsService);

  readonly systemInfo = computed(() => this.devToolsService.systemInfo());
  readonly memoryInfo = computed(() => this.devToolsService.memoryInfo());
  readonly processInfo = computed(() => this.devToolsService.processInfo());
  readonly networkInfo = computed(() => this.devToolsService.networkInfo());
  readonly performance = computed(() => this.devToolsService.performance());
  readonly events = computed(() => this.devToolsService.events());

  readonly errorCount = computed(() => this.events().filter(e => e.type === 'error').length);
  readonly warnCount = computed(() => this.events().filter(e => e.type === 'warn').length);

  ngOnInit(): void {
    this.devToolsService.gatherAllData();
  }
}

// ==================== System Component ====================
@Component({
  selector: 'app-devtools-system',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">💻 System Information</h3>
      @if (systemInfo()) {
        <table class="info-table">
          <tr>
            <td class="info-table__label">Hostname</td>
            <td class="info-table__value">{{ systemInfo()?.hostname }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Username</td>
            <td class="info-table__value">{{ systemInfo()?.username }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Operating System</td>
            <td class="info-table__value">{{ systemInfo()?.os }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Architecture</td>
            <td class="info-table__value">{{ systemInfo()?.arch }}</td>
          </tr>
          <tr>
            <td class="info-table__label">CPU Cores</td>
            <td class="info-table__value">{{ systemInfo()?.cpu_count }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Rust Version</td>
            <td class="info-table__value">{{ systemInfo()?.rust_version }}</td>
          </tr>
          <tr>
            <td class="info-table__label">App Version</td>
            <td class="info-table__value">{{ systemInfo()?.app_version }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Build Time</td>
            <td class="info-table__value">{{ systemInfo()?.build_time }}</td>
          </tr>
        </table>
      } @else {
        <div class="loading">Loading system information...</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid #3c3c3c; }
    .info-table__label { padding: 10px; color: #888; width: 200px; }
    .info-table__value { padding: 10px; color: #d4d4d4; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsSystemComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly systemInfo = computed(() => this.devToolsService.systemInfo());
}

// ==================== Memory Component ====================
@Component({
  selector: 'app-devtools-memory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">🧠 Memory Information</h3>
      @if (memoryInfo()) {
        <div class="memory-visual">
          <div class="memory-bar">
            <div class="memory-bar__fill" [style.width.%]="memoryInfo()?.percent_used"></div>
          </div>
          <div class="memory-stats">
            <div class="memory-stat">
              <span class="memory-stat__value">{{ memoryInfo()?.used_mb }} MB</span>
              <span class="memory-stat__label">Used</span>
            </div>
            <div class="memory-stat">
              <span class="memory-stat__value">{{ memoryInfo()?.free_mb }} MB</span>
              <span class="memory-stat__label">Free</span>
            </div>
            <div class="memory-stat">
              <span class="memory-stat__value">{{ memoryInfo()?.total_mb }} MB</span>
              <span class="memory-stat__label">Total</span>
            </div>
          </div>
        </div>
      } @else {
        <div class="loading">Loading memory information...</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .memory-visual { background: #252526; border-radius: 8px; padding: 16px; }
    .memory-bar {
      height: 24px;
      background: #3c3c3c;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .memory-bar__fill {
      height: 100%;
      background: linear-gradient(90deg, #4ade80, #fbbf24, #ef4444);
      transition: width 0.3s;
    }
    .memory-stats { display: flex; gap: 24px; }
    .memory-stat { text-align: center; }
    .memory-stat__value { display: block; font-size: 18px; font-weight: 600; color: #fff; }
    .memory-stat__label { display: block; font-size: 11px; color: #888; margin-top: 4px; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsMemoryComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly memoryInfo = computed(() => this.devToolsService.memoryInfo());
}

// ==================== Process Component ====================
@Component({
  selector: 'app-devtools-process',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">⚙️ Process Information</h3>
      @if (processInfo()) {
        <table class="info-table">
          <tr>
            <td class="info-table__label">Process ID</td>
            <td class="info-table__value">{{ processInfo()?.pid }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Process Name</td>
            <td class="info-table__value">{{ processInfo()?.name }}</td>
          </tr>
          <tr>
            <td class="info-table__label">CPU Usage</td>
            <td class="info-table__value">{{ processInfo()?.cpu_percent }}%</td>
          </tr>
          <tr>
            <td class="info-table__label">Memory Usage</td>
            <td class="info-table__value">{{ processInfo()?.memory_mb }} MB</td>
          </tr>
          <tr>
            <td class="info-table__label">Threads</td>
            <td class="info-table__value">{{ processInfo()?.threads }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Uptime</td>
            <td class="info-table__value">{{ formatUptime(processInfo()?.uptime_seconds || 0) }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Started</td>
            <td class="info-table__value">{{ processInfo()?.start_time }}</td>
          </tr>
        </table>
      } @else {
        <div class="loading">Loading process information...</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid #3c3c3c; }
    .info-table__label { padding: 10px; color: #888; width: 200px; }
    .info-table__value { padding: 10px; color: #d4d4d4; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsProcessComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly processInfo = computed(() => this.devToolsService.processInfo());

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${mins}m ${secs}s`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}

// ==================== Network Component ====================
@Component({
  selector: 'app-devtools-network',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">🌐 Network Information</h3>
      @if (networkInfo()) {
        <div class="network-summary">
          <div class="network-summary__item">
            <span class="network-summary__label">Port</span>
            <span class="network-summary__value">{{ networkInfo()?.default_port }}</span>
          </div>
          <div class="network-summary__item">
            <span class="network-summary__label">WebUI Bound</span>
            <span class="network-summary__value" [class.status-ok]="networkInfo()?.is_webui_bound">
              {{ networkInfo()?.is_webui_bound ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="network-summary__item">
            <span class="network-summary__label">Interfaces</span>
            <span class="network-summary__value">{{ networkInfo()?.interfaces?.length ?? 0 }}</span>
          </div>
        </div>

        <h4 class="subsection-title">Network Interfaces</h4>
        <table class="info-table">
          <thead>
            <tr>
              <th class="info-table__header">Name</th>
              <th class="info-table__header">IP Address</th>
              <th class="info-table__header">MAC Address</th>
              <th class="info-table__header">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (iface of networkInfo()?.interfaces; track iface.name) {
              <tr>
                <td class="info-table__cell">{{ iface.name }}</td>
                <td class="info-table__cell">{{ iface.ip }}</td>
                <td class="info-table__cell">{{ iface.mac }}</td>
                <td class="info-table__cell">
                  <span class="status-badge" [class.status-ok]="iface.is_up">
                    {{ iface.is_up ? 'Up' : 'Down' }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td class="info-table__cell" colspan="4">No network interfaces found</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="loading">Loading network information...</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .network-summary { display: flex; gap: 16px; margin-bottom: 20px; }
    .network-summary__item {
      background: #252526;
      padding: 12px 16px;
      border-radius: 6px;
      text-align: center;
    }
    .network-summary__label { display: block; font-size: 11px; color: #888; margin-bottom: 4px; }
    .network-summary__value { display: block; font-size: 18px; font-weight: 600; color: #fff; }
    .subsection-title { margin: 0 0 12px; font-size: 12px; color: #888; text-transform: uppercase; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table__header { padding: 10px; text-align: left; color: #888; font-weight: 500; border-bottom: 2px solid #3c3c3c; }
    .info-table__cell { padding: 10px; border-bottom: 1px solid #3c3c3c; color: #d4d4d4; }
    .status-badge { padding: 2px 8px; border-radius: 3px; font-size: 10px; background: #3c3c3c; }
    .status-ok { background: #4ade80; color: #000; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsNetworkComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly networkInfo = computed(() => this.devToolsService.networkInfo());
}

// ==================== Database Component ====================
@Component({
  selector: 'app-devtools-database',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">🗄️ Database Information</h3>
      @if (databaseInfo()) {
        <div class="db-summary">
          <div class="db-summary__item">
            <span class="db-summary__label">Path</span>
            <span class="db-summary__value db-summary__value--small">{{ databaseInfo()?.path }}</span>
          </div>
          <div class="db-summary__item">
            <span class="db-summary__label">Size</span>
            <span class="db-summary__value">{{ databaseInfo()?.size_kb }} KB</span>
          </div>
          <div class="db-summary__item">
            <span class="db-summary__label">Tables</span>
            <span class="db-summary__value">{{ databaseInfo()?.table_count }}</span>
          </div>
          <div class="db-summary__item">
            <span class="db-summary__label">Connections</span>
            <span class="db-summary__value">{{ databaseInfo()?.active_connections }} / {{ databaseInfo()?.connection_pool_size }}</span>
          </div>
        </div>

        <h4 class="subsection-title">Tables</h4>
        @for (table of databaseInfo()?.tables; track table.name) {
          <div class="table-card">
            <div class="table-card__header">
              <span class="table-card__name">{{ table.name }}</span>
              <span class="table-card__count">{{ table.row_count }} rows</span>
            </div>
            <table class="info-table">
              <thead>
                <tr>
                  <th class="info-table__header">Column</th>
                  <th class="info-table__header">Type</th>
                  <th class="info-table__header">Nullable</th>
                  <th class="info-table__header">Key</th>
                </tr>
              </thead>
              <tbody>
                @for (col of table.columns; track col.name) {
                  <tr>
                    <td class="info-table__cell">{{ col.name }}</td>
                    <td class="info-table__cell">{{ col.type }}</td>
                    <td class="info-table__cell">{{ col.nullable ? 'Yes' : 'No' }}</td>
                    <td class="info-table__cell">{{ col.is_primary_key ? '🔑 PK' : '' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @empty {
          <div class="loading">No tables found</div>
        }
      } @else {
        <div class="loading">Loading database information...</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .db-summary { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .db-summary__item {
      background: #252526;
      padding: 12px 16px;
      border-radius: 6px;
    }
    .db-summary__label { display: block; font-size: 11px; color: #888; margin-bottom: 4px; }
    .db-summary__value { display: block; font-size: 16px; font-weight: 600; color: #fff; }
    .db-summary__value--small { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .subsection-title { margin: 0 0 12px; font-size: 12px; color: #888; text-transform: uppercase; }
    .table-card {
      background: #252526;
      border-radius: 6px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .table-card__header {
      display: flex;
      justify-content: space-between;
      padding: 10px 12px;
      background: #3c3c3c;
    }
    .table-card__name { font-weight: 600; color: #fff; }
    .table-card__count { font-size: 11px; color: #888; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table__header { padding: 8px; text-align: left; color: #888; font-weight: 500; border-bottom: 1px solid #3c3c3c; font-size: 11px; }
    .info-table__cell { padding: 8px; border-bottom: 1px solid #3c3c3c; color: #d4d4d4; font-size: 11px; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsDatabaseComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly databaseInfo = computed(() => this.devToolsService.databaseInfo());
}

// ==================== Config Component ====================
@Component({
  selector: 'app-devtools-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">📋 Configuration</h3>
      @if (configInfo()) {
        <table class="info-table">
          <tr>
            <td class="info-table__label">App Name</td>
            <td class="info-table__value">{{ configInfo()?.app_name }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Version</td>
            <td class="info-table__value">{{ configInfo()?.version }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Log Level</td>
            <td class="info-table__value">{{ configInfo()?.log_level }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Log File</td>
            <td class="info-table__value">{{ configInfo()?.log_file }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Database Path</td>
            <td class="info-table__value">{{ configInfo()?.database_path }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Port</td>
            <td class="info-table__value">{{ configInfo()?.port }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Debug Mode</td>
            <td class="info-table__value">
              <span class="status-badge" [class.status-warn]="configInfo()?.debug_mode">
                {{ configInfo()?.debug_mode ? 'Enabled' : 'Disabled' }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="info-table__label">Features</td>
            <td class="info-table__value">
              @for (feature of configInfo()?.features; track feature) {
                <span class="feature-badge">{{ feature }}</span>
              } @empty {
                <span class="text-muted">None</span>
              }
            </td>
          </tr>
        </table>
      } @else {
        <div class="loading">Loading configuration...</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid #3c3c3c; }
    .info-table__label { padding: 10px; color: #888; width: 200px; }
    .info-table__value { padding: 10px; color: #d4d4d4; }
    .status-badge { padding: 2px 8px; border-radius: 3px; font-size: 10px; background: #3c3c3c; }
    .status-warn { background: #fbbf24; color: #000; }
    .feature-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #0e639c;
      border-radius: 3px;
      font-size: 10px;
      margin-right: 4px;
    }
    .text-muted { color: #666; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsConfigComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly configInfo = computed(() => this.devToolsService.configInfo());
}

// ==================== Performance Component ====================
@Component({
  selector: 'app-devtools-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">📈 Performance Metrics</h3>
      @if (performance()) {
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-card__icon">⚡</div>
            <div class="metric-card__value">{{ performance()?.fps }}</div>
            <div class="metric-card__label">FPS</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon">🌳</div>
            <div class="metric-card__value">{{ performance()?.dom_nodes }}</div>
            <div class="metric-card__label">DOM Nodes</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon">🧠</div>
            <div class="metric-card__value">{{ performance()?.js_heap_used_mb }} MB</div>
            <div class="metric-card__label">JS Heap Used</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon">🎧</div>
            <div class="metric-card__value">{{ performance()?.event_listeners }}</div>
            <div class="metric-card__label">Event Listeners</div>
          </div>
          <div class="metric-card">
            <div class="metric-card__icon">🪟</div>
            <div class="metric-card__value">{{ performance()?.open_windows }}</div>
            <div class="metric-card__label">Open Windows</div>
          </div>
        </div>
      } @else {
        <div class="loading">Loading performance metrics...</div>
      }

      <h4 class="subsection-title">Environment</h4>
      @if (environment()) {
        <table class="info-table">
          <tr>
            <td class="info-table__label">Angular Version</td>
            <td class="info-table__value">{{ environment()?.angular_version }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Browser</td>
            <td class="info-table__value">{{ environment()?.browser }}</td>
          </tr>
          <tr>
            <td class="info-table__label">Screen</td>
            <td class="info-table__value">{{ environment()?.screen_resolution }} ({{ environment()?.color_depth }}-bit)</td>
          </tr>
          <tr>
            <td class="info-table__label">Device Pixel Ratio</td>
            <td class="info-table__value">{{ environment()?.device_pixel_ratio }}x</td>
          </tr>
          <tr>
            <td class="info-table__label">WebGL</td>
            <td class="info-table__value">
              <span class="status-badge" [class.status-ok]="environment()?.webgl_enabled">
                {{ environment()?.webgl_enabled ? 'Enabled' : 'Disabled' }}
              </span>
              @if (environment()?.webgl_renderer) {
                <span class="text-muted">{{ environment()?.webgl_renderer }}</span>
              }
            </td>
          </tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .metric-card {
      background: #252526;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .metric-card__icon { font-size: 24px; margin-bottom: 8px; }
    .metric-card__value { font-size: 24px; font-weight: 600; color: #4ade80; margin-bottom: 4px; }
    .metric-card__label { font-size: 11px; color: #888; }
    .subsection-title { margin: 0 0 12px; font-size: 12px; color: #888; text-transform: uppercase; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid #3c3c3c; }
    .info-table__label { padding: 10px; color: #888; width: 200px; }
    .info-table__value { padding: 10px; color: #d4d4d4; }
    .status-badge { padding: 2px 8px; border-radius: 3px; font-size: 10px; background: #3c3c3c; }
    .status-ok { background: #4ade80; color: #000; }
    .text-muted { color: #666; margin-left: 8px; }
    .loading { color: #666; font-style: italic; }
  `],
})
export class DevToolsPerformanceComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly performance = computed(() => this.devToolsService.performance());
  readonly environment = computed(() => this.devToolsService.environment());
}

// ==================== Events Component ====================
@Component({
  selector: 'app-devtools-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <div class="events-header">
        <h3 class="panel-title">📜 Event Log</h3>
        <div class="events-actions">
          <button class="btn btn--small" (click)="clearEvents()">Clear</button>
        </div>
      </div>
      
      <div class="events-filters">
        <button class="filter-btn" [class.active]="filter() === 'all'" (click)="filter.set('all')">All</button>
        <button class="filter-btn" [class.active]="filter() === 'error'" (click)="filter.set('error')">Errors</button>
        <button class="filter-btn" [class.active]="filter() === 'warn'" (click)="filter.set('warn')">Warnings</button>
        <button class="filter-btn" [class.active]="filter() === 'info'" (click)="filter.set('info')">Info</button>
      </div>

      <div class="events-list">
        @for (event of filteredEvents(); track event.id) {
          <div class="event-item" [class.event-item--error]="event.type === 'error'" [class.event-item--warn]="event.type === 'warn'">
            <div class="event-item__header">
              <span class="event-item__type" [class]=" 'event-type--' + event.type">{{ event.type }}</span>
              <span class="event-item__source">{{ event.source }}</span>
              <span class="event-item__time">{{ event.timestamp }}</span>
            </div>
            <div class="event-item__message">{{ event.message }}</div>
            @if (event.data) {
              <pre class="event-item__data">{{ event.data | json }}</pre>
            }
          </div>
        } @empty {
          <div class="events-empty">No events to display</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; display: flex; flex-direction: column; height: 100%; }
    .events-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .panel-title { margin: 0; font-size: 14px; color: #fff; }
    .btn { background: #0e639c; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
    .btn--small { padding: 4px 8px; font-size: 11px; }
    .events-filters { display: flex; gap: 8px; margin-bottom: 12px; }
    .filter-btn {
      padding: 4px 12px;
      background: #252526;
      border: 1px solid #3c3c3c;
      border-radius: 4px;
      color: #888;
      cursor: pointer;
      font-size: 11px;
    }
    .filter-btn:hover { background: #3c3c3c; }
    .filter-btn.active { background: #0e639c; color: #fff; border-color: #0e639c; }
    .events-list { flex: 1; overflow-y: auto; }
    .event-item {
      background: #252526;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 8px;
      border-left: 3px solid #3c3c3c;
    }
    .event-item--error { border-left-color: #ef4444; }
    .event-item--warn { border-left-color: #fbbf24; }
    .event-item__header { display: flex; gap: 12px; margin-bottom: 6px; font-size: 11px; }
    .event-item__type { font-weight: 600; text-transform: uppercase; }
    .event-type--error { color: #ef4444; }
    .event-type--warn { color: #fbbf24; }
    .event-type--info { color: #4ade80; }
    .event-type--debug { color: #60a5fa; }
    .event-type--system { color: #a78bfa; }
    .event-item__source { color: #888; }
    .event-item__time { color: #666; margin-left: auto; }
    .event-item__message { color: #d4d4d4; margin-bottom: 6px; }
    .event-item__data {
      background: #1e1e1e;
      padding: 8px;
      border-radius: 4px;
      font-size: 10px;
      color: #9cdcfe;
      overflow-x: auto;
      margin: 0;
    }
    .events-empty { color: #666; text-align: center; padding: 40px; }
  `],
})
export class DevToolsEventsComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly events = computed(() => this.devToolsService.events());
  readonly filter = signal<'all' | 'error' | 'warn' | 'info'>('all');

  readonly filteredEvents = computed(() => {
    const allEvents = this.events();
    const f = this.filter();
    if (f === 'all') return allEvents;
    return allEvents.filter(e => e.type === f);
  });

  clearEvents(): void {
    this.devToolsService.clearEvents();
  }
}

// ==================== Bindings Component ====================
@Component({
  selector: 'app-devtools-bindings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">🔗 Backend Bindings</h3>
      <table class="info-table">
        <thead>
          <tr>
            <th class="info-table__header">Function Name</th>
            <th class="info-table__header">Status</th>
            <th class="info-table__header">Calls</th>
          </tr>
        </thead>
        <tbody>
          @for (binding of bindings(); track binding.name) {
            <tr>
              <td class="info-table__cell"><code class="code">{{ binding.name }}</code></td>
              <td class="info-table__cell">
                <span class="status-badge" [class.status-ok]="binding.bound" [class.status-error]="!binding.bound">
                  {{ binding.bound ? '✓ Bound' : '✗ Not Bound' }}
                </span>
              </td>
              <td class="info-table__cell">{{ binding.call_count }}</td>
            </tr>
          } @empty {
            <tr>
              <td class="info-table__cell" colspan="3">No bindings found</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table__header { padding: 10px; text-align: left; color: #888; font-weight: 500; border-bottom: 2px solid #3c3c3c; }
    .info-table__cell { padding: 10px; border-bottom: 1px solid #3c3c3c; color: #d4d4d4; }
    .code {
      background: #1e1e1e;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 11px;
      color: #9cdcfe;
    }
    .status-badge { padding: 2px 8px; border-radius: 3px; font-size: 10px; background: #3c3c3c; }
    .status-ok { background: #4ade80; color: #000; }
    .status-error { background: #ef4444; color: #fff; }
  `],
})
export class DevToolsBindingsComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly bindings = computed(() => this.devToolsService.bindings());
}

// ==================== Windows Component ====================
@Component({
  selector: 'app-devtools-windows',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <h3 class="panel-title">🪟 Open Windows</h3>
      @if (windows() && windows().length > 0) {
        <div class="windows-list">
          @for (win of windows(); track win.id) {
            <div class="window-item">
              <div class="window-item__header">
                <span class="window-item__title">{{ win.title }}</span>
                <div class="window-item__status">
                  @if (win.is_minimized) {
                    <span class="status-badge status-badge--minimized">🗕 Minimized</span>
                  }
                  @if (win.is_maximized) {
                    <span class="status-badge status-badge--maximized">🗗 Maximized</span>
                  }
                  @if (win.is_focused) {
                    <span class="status-badge status-badge--focused">🎯 Focused</span>
                  }
                </div>
              </div>
              <div class="window-item__details">
                <span class="window-item__detail">ID: {{ win.id }}</span>
                <span class="window-item__detail">Position: ({{ win.x }}, {{ win.y }})</span>
                <span class="window-item__detail">Size: {{ win.width }}x{{ win.height }}</span>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="windows-empty">No windows open</div>
      }
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .panel-title { margin: 0 0 16px; font-size: 14px; color: #fff; }
    .windows-list { display: flex; flex-direction: column; gap: 8px; }
    .window-item {
      background: #252526;
      border-radius: 6px;
      padding: 12px;
    }
    .window-item__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .window-item__title { font-weight: 600; color: #fff; }
    .window-item__status { display: flex; gap: 4px; }
    .status-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; background: #3c3c3c; }
    .status-badge--minimized { background: #666; }
    .status-badge--maximized { background: #0e639c; }
    .status-badge--focused { background: #4ade80; color: #000; }
    .window-item__details { display: flex; gap: 16px; font-size: 11px; color: #888; }
    .window-item__detail { font-family: 'Consolas', 'Monaco', monospace; }
    .windows-empty { color: #666; text-align: center; padding: 40px; }
  `],
})
export class DevToolsWindowsComponent {
  private readonly devToolsService = inject(DevToolsService);
  readonly windows = computed(() => this.devToolsService.windows());
}

// ==================== About Component ====================
@Component({
  selector: 'app-devtools-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="devtools-panel">
      <div class="about-content">
        <div class="about-logo">🔧</div>
        <h2 class="about-title">DevTools</h2>
        <p class="about-subtitle">Comprehensive system diagnostics for Rust WebUI Application</p>
        
        <div class="about-sections">
          <div class="about-section">
            <h3 class="about-section__title">Frontend</h3>
            <ul class="about-list">
              <li>Angular 19.2.18</li>
              <li>Rsbuild Build System</li>
              <li>TypeScript 5.5.4</li>
              <li>WinBox.js for Windows</li>
            </ul>
          </div>
          
          <div class="about-section">
            <h3 class="about-section__title">Backend</h3>
            <ul class="about-list">
              <li>Rust</li>
              <li>WebUI-rs</li>
              <li>SQLite</li>
              <li>Serde Serialization</li>
            </ul>
          </div>
          
          <div class="about-section">
            <h3 class="about-section__title">Features</h3>
            <ul class="about-list">
              <li>Real-time system monitoring</li>
              <li>Memory & process tracking</li>
              <li>Network diagnostics</li>
              <li>Database inspection</li>
              <li>Event logging</li>
              <li>Performance metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .devtools-panel { padding: 8px; }
    .about-content { text-align: center; padding: 20px; }
    .about-logo { font-size: 48px; margin-bottom: 16px; }
    .about-title { margin: 0; font-size: 24px; color: #fff; }
    .about-subtitle { margin: 8px 0 24px; color: #888; font-size: 13px; }
    .about-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: left; }
    .about-section { background: #252526; border-radius: 8px; padding: 16px; }
    .about-section__title { margin: 0 0 12px; font-size: 14px; color: #fff; }
    .about-list { list-style: none; padding: 0; margin: 0; }
    .about-list li { padding: 6px 0; color: #d4d4d4; font-size: 12px; border-bottom: 1px solid #3c3c3c; }
    .about-list li:last-child { border-bottom: none; }
  `],
})
export class DevToolsAboutComponent {}
