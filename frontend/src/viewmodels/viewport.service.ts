import { Injectable, signal, computed } from '@angular/core';

export interface ViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly topPanelHeight = 80;
  private readonly topPanelCollapsedHeight = 40;
  private readonly bottomPanelHeight = 130;
  private readonly bottomPanelCollapsedHeight = 40;

  readonly topCollapsed = signal<boolean>(false);
  readonly bottomCollapsed = signal<boolean>(true);

  readonly availableViewport = computed<ViewportRect>(() => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800;

    const topHeight = this.topCollapsed() ? this.topPanelCollapsedHeight : this.topPanelHeight;
    const bottomHeight = this.bottomCollapsed() ? this.bottomPanelCollapsedHeight : this.bottomPanelHeight;

    const availableHeight = windowHeight - topHeight - bottomHeight - 8 - 4;

    return {
      left: 10,
      top: topHeight + 4,
      width: windowWidth - 20,
      height: Math.max(200, availableHeight),
    };
  });

  toggleTop(): void {
    this.topCollapsed.update((v) => !v);
  }

  toggleBottom(): void {
    this.bottomCollapsed.update((v) => !v);
  }

  setTopCollapsed(collapsed: boolean): void {
    this.topCollapsed.set(collapsed);
  }

  setBottomCollapsed(collapsed: boolean): void {
    this.bottomCollapsed.set(collapsed);
  }
}
