import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'contrato-ia-theme';

  /** Reactive signal — components can read this to adapt UI */
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply theme class whenever signal changes
    effect(() => {
      const t = this.theme();
      const html = document.documentElement;

      if (t === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      localStorage.setItem(this.STORAGE_KEY, t);
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored) return stored;

    // Respeita preferência do SO
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }
}
