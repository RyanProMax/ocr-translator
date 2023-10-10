import { useEffect, useState } from 'react';

enum THEME {
  Light,
  Dark,
}

export default () => {
  const [theme] = useState(THEME.Dark);

  useEffect(() => {
    if (theme === THEME.Light) {
      document.body.removeAttribute('arco-theme');
    } else {
      document.body.setAttribute('arco-theme', 'dark');
    }
  }, [theme]);
};
