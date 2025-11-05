import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ThemeMode } from '../types/typeUserProfile';

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme') as ThemeMode | null;
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(getPreferredTheme);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.setProperty('color-scheme', mode === 'dark' ? 'dark' : 'light');
    localStorage.setItem('theme', mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const palette = useMemo(() => ({
    surface: 'var(--color-bg-surface)',
    canvas: 'var(--color-bg-canvas)',
    muted: 'var(--color-bg-muted)',
    border: 'var(--color-border)',
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)'
    },
    primary: {
      base: 'var(--color-primary)',
      strong: 'var(--color-primary-strong)'
    },
    accent: 'var(--color-accent)',
    shadow: 'var(--shadow-elevated)'
  }), []);

  return { theme, isDark: theme === 'dark', toggleTheme, palette };
};

export default useTheme;
