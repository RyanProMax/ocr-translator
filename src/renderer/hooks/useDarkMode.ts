import { useEffect, useState } from 'react';
import { IconMoon, IconSun } from '@arco-design/web-react/icon';

enum THEME {
  Light,
  Dark,
}

const mediaQueryListDark = window.matchMedia('(prefers-color-scheme: dark)');

export default () => {
  const [theme, setTheme] = useState(
    mediaQueryListDark.matches ? THEME.Dark : THEME.Light
  );
  const ThemeIcon = theme === THEME.Light ? IconSun : IconMoon;

  const toggleTheme = () => setTheme(t => t === THEME.Dark ? THEME.Light : THEME.Dark);

  useEffect(() => {
    if (theme === THEME.Light) {
      document.body.removeAttribute('arco-theme');
    } else {
      document.body.setAttribute('arco-theme', 'dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleChangeTheme = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? THEME.Dark : THEME.Light);
    };

    mediaQueryListDark.addEventListener('change', handleChangeTheme);
    return () => mediaQueryListDark.removeEventListener('change', handleChangeTheme);
  }, []);

  return { ThemeIcon, theme, toggleTheme };
};
