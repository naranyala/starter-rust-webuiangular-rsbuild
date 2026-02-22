import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { DevToolsService } from '../../viewmodels/devtools.service';
import type { DevToolsTab, DevToolsTabId } from '../../models/devtools.model';
import {
  DevToolsOverviewComponent,
  DevToolsSystemComponent,
  DevToolsMemoryComponent,
  DevToolsProcessComponent,
  DevToolsNetworkComponent,
  DevToolsDatabaseComponent,
  DevToolsConfigComponent,
  DevToolsPerformanceComponent,
  DevToolsEventsComponent,
  DevToolsBindingsComponent,
  DevToolsWindowsComponent,
  DevToolsAboutComponent,
} from './devtools-panels.component';

@Component({
  selector: 'app-devtools',
  standalone: true,
  imports: [
    CommonModule,
    DevToolsOverviewComponent,
    DevToolsSystemComponent,
    DevToolsMemoryComponent,
    DevToolsProcessComponent,
    DevToolsNetworkComponent,
    DevToolsDatabaseComponent,
    DevToolsConfigComponent,
    DevToolsPerformanceComponent,
    DevToolsEventsComponent,
    DevToolsBindingsComponent,
    DevToolsWindowsComponent,
    DevToolsAboutComponent,
  ],
  template: `
    <div class="devtools-container">
      <!-- DevTools Header -->
      <div class="devtools-header">
        <div class="devtools-header__left">
          <span class="devtools-header__icon">🔧</span>
          <span class="devtools-header__title">DevTools</span>
          <span class="devtools-header__badge">{{ lastUpdated() }}</span>
        </div>
        <div class="devtools-header__right">
          <button class="devtools-header__btn" (click)="refresh()" title="Refresh (F5)">
            <span class="devtools-header__btn-icon">🔄</span>
          </button>
          <button class="devtools-header__btn" [class.active]="autoRefresh()" (click)="toggleAutoRefresh()" title="Auto-refresh">
            <span class="devtools-header__btn-icon">{{ autoRefresh() ? '⏸️' : '▶️' }}</span>
          </button>
          <button class="devtools-header__btn" (click)="exportData()" title="Export JSON">
            <span class="devtools-header__btn-icon">📥</span>
          </button>
        </div>
      </div>

      <!-- DevTools Tabs -->
      <div class="devtools-tabs">
        @for (tab of tabs; track tab.id) {
          <button class="devtools-tabs__tab"
                  [class.active]="activeTab() === tab.id"
                  (click)="selectTab(tab.id)">
            <span class="devtools-tabs__icon">{{ tab.icon }}</span>
            <span class="devtools-tabs__label">{{ tab.label }}</span>
            @if (tab.badge) {
              <span class="devtools-tabs__badge">{{ tab.badge }}</span>
            }
          </button>
        }
      </div>

      <!-- DevTools Content -->
      <div class="devtools-content">
        @switch (activeTab()) {
          @case ('overview') {
            <app-devtools-overview></app-devtools-overview>
          }
          @case ('system') {
            <app-devtools-system></app-devtools-system>
          }
          @case ('memory') {
            <app-devtools-memory></app-devtools-memory>
          }
          @case ('process') {
            <app-devtools-process></app-devtools-process>
          }
          @case ('network') {
            <app-devtools-network></app-devtools-network>
          }
          @case ('database') {
            <app-devtools-database></app-devtools-database>
          }
          @case ('config') {
            <app-devtools-config></app-devtools-config>
          }
          @case ('performance') {
            <app-devtools-performance></app-devtools-performance>
          }
          @case ('events') {
            <app-devtools-events></app-devtools-events>
          }
          @case ('bindings') {
            <app-devtools-bindings></app-devtools-bindings>
          }
          @case ('windows') {
            <app-devtools-windows></app-devtools-windows>
          }
          @case ('about') {
            <app-devtools-about></app-devtools-about>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
    }

    .devtools-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    /* Header */
    .devtools-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #252526;
      border-bottom: 1px solid #3c3c3c;
      flex-shrink: 0;
    }

    .devtools-header__left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .devtools-header__icon {
      font-size: 16px;
    }

    .devtools-header__title {
      font-weight: 600;
      color: #fff;
      font-size: 13px;
    }

    .devtools-header__badge {
      padding: 2px 6px;
      background: #3c3c3c;
      border-radius: 3px;
      font-size: 10px;
      color: #888;
    }

    .devtools-header__right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .devtools-header__btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      color: #888;
      cursor: pointer;
      transition: all 0.2s;
    }

    .devtools-header__btn:hover {
      background: #3c3c3c;
      color: #fff;
    }

    .devtools-header__btn.active {
      background: #0e639c;
      color: #fff;
    }

    .devtools-header__btn-icon {
      font-size: 14px;
    }

    /* Tabs */
    .devtools-tabs {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 8px;
      background: #252526;
      border-bottom: 1px solid #3c3c3c;
      overflow-x: auto;
      flex-shrink: 0;
    }

    .devtools-tabs::-webkit-scrollbar {
      height: 3px;
    }

    .devtools-tabs::-webkit-scrollbar-thumb {
      background: #3c3c3c;
      border-radius: 2px;
    }

    .devtools-tabs__tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: transparent;
      border: none;
      border-radius: 4px 4px 0 0;
      color: #888;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      position: relative;
      font-size: 11px;
    }

    .devtools-tabs__tab:hover {
      background: #2d2d30;
      color: #fff;
    }

    .devtools-tabs__tab.active {
      background: #1e1e1e;
      color: #fff;
    }

    .devtools-tabs__tab.active::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #007acc;
    }

    .devtools-tabs__icon {
      font-size: 12px;
    }

    .devtools-tabs__badge {
      padding: 1px 4px;
      background: #007acc;
      border-radius: 3px;
      font-size: 9px;
      color: #fff;
    }

    /* Content */
    .devtools-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .devtools-content::-webkit-scrollbar {
      width: 8px;
    }

    .devtools-content::-webkit-scrollbar-track {
      background: #1e1e1e;
    }

    .devtools-content::-webkit-scrollbar-thumb {
      background: #3c3c3c;
      border-radius: 4px;
    }
  `],
})
export class DevToolsComponent implements OnInit, OnDestroy {
  private readonly devToolsService = inject(DevToolsService);

  readonly tabs: DevToolsTab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'system', label: 'System', icon: '💻' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
    { id: 'process', label: 'Process', icon: '⚙️' },
    { id: 'network', label: 'Network', icon: '🌐' },
    { id: 'database', label: 'Database', icon: '🗄️' },
    { id: 'config', label: 'Config', icon: '📋' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'events', label: 'Events', icon: '📜' },
    { id: 'bindings', label: 'Bindings', icon: '🔗' },
    { id: 'windows', label: 'Windows', icon: '🪟' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  readonly activeTab = signal<DevToolsTabId>('overview');
  readonly autoRefresh = signal(false);
  readonly lastUpdated = signal('');

  ngOnInit(): void {
    this.devToolsService.init();
    this.updateLastUpdated();
    
    // Start with auto-refresh enabled
    this.toggleAutoRefresh();
  }

  ngOnDestroy(): void {
    this.devToolsService.stopAutoRefresh();
  }

  selectTab(tabId: DevToolsTabId): void {
    this.activeTab.set(tabId);
  }

  refresh(): void {
    this.devToolsService.gatherAllData();
    this.updateLastUpdated();
  }

  toggleAutoRefresh(): void {
    const newState = !this.autoRefresh();
    this.autoRefresh.set(newState);
    
    if (newState) {
      this.devToolsService.startAutoRefresh(2000);
    } else {
      this.devToolsService.stopAutoRefresh();
    }
  }

  exportData(): void {
    const data = this.devToolsService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-export-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private updateLastUpdated(): void {
    this.lastUpdated.set(new Date().toLocaleTimeString());
  }
}
