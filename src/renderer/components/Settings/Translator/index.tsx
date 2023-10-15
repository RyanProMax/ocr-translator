import { useMemo, useState, FC } from 'react';
import { Menu } from '@arco-design/web-react';
import { TranslatorType } from 'src/renderer/server';

import { THEME } from 'src/renderer/hooks/useDarkMode';
import BaiduForm from './BaiduForm';

const MenuItem = Menu.Item;

export default ({ theme }: {
  theme: THEME
}) => {
  const [type, setType] = useState(TranslatorType.Baidu);

  const FormComponent = useMemo<FC>(() => {
    switch (type) {
      case TranslatorType.Baidu: {
        return BaiduForm;
      }
      default: return () => null;
    }
  }, [type]);

  const onClickMenuItem = (value: string) => {
    setType(value as TranslatorType);
  };

  return (
    <div className='settings-main-content settings-translator'>
      <Menu
        mode='horizontal'
        theme={theme}
        selectedKeys={[type]}
        onClickMenuItem={onClickMenuItem}
        className='settings-main-content__menu'
      >
        {Object.entries(TranslatorType)
          .filter(([value]) => value !== TranslatorType.None)
          .map(([key, value]) => (
            <MenuItem key={value} disabled={value === TranslatorType.Local}>
              {key}
            </MenuItem>
          ))
        }
      </Menu>
      <FormComponent />
    </div>
  );
};
