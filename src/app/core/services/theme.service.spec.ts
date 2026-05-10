import { TestBed } from '@angular/core/testing';
import { ThemeService, Theme } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  function createService(storedTheme: string | null = null, prefersDark = false) {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'contrato-ia-theme') return storedTheme;
      return null;
    });
    spyOn(localStorage, 'setItem');
    spyOn(window, 'matchMedia').and.returnValue({
      matches: prefersDark,
    } as MediaQueryList);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    // Flush effect
    TestBed.flushEffects();
  }

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should be created', () => {
    createService();
    expect(service).toBeTruthy();
  });

  it('should default to light theme when no stored preference and OS prefers light', () => {
    createService(null, false);
    expect(service.theme()).toBe('light');
  });

  it('should use stored theme from localStorage', () => {
    createService('dark');
    expect(service.theme()).toBe('dark');
  });

  it('should respect OS dark mode preference when no stored theme', () => {
    createService(null, true);
    expect(service.theme()).toBe('dark');
  });

  it('should add dark class to html element when theme is dark', () => {
    createService('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });

  it('should remove dark class from html element when theme is light', () => {
    document.documentElement.classList.add('dark');
    createService('light');
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should persist theme to localStorage', () => {
    createService('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('contrato-ia-theme', 'light');
  });

  it('should toggle from light to dark', () => {
    createService('light');
    service.toggle();
    TestBed.flushEffects();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
  });

  it('should toggle from dark to light', () => {
    createService('dark');
    service.toggle();
    TestBed.flushEffects();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should save toggled theme to localStorage', () => {
    createService('light');
    service.toggle();
    TestBed.flushEffects();
    expect(localStorage.setItem).toHaveBeenCalledWith('contrato-ia-theme', 'dark');
  });
});
