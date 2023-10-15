import { Menu } from '@arco-design/web-react';
import { FC, useMemo, useState } from 'react';
import { OCRType } from 'src/renderer/server';

import { THEME } from 'src/renderer/hooks/useDarkMode';
import BaiduForm from './BaiduForm';
import TesseractForm from './TesseractForm';

const MenuItem = Menu.Item;

export default ({ theme }: {
  theme: THEME
}) => {
  const [type, setType] = useState(OCRType.Baidu);

  const FormComponent = useMemo<FC>(() => {
    switch (type) {
      case OCRType.Baidu: {
        return BaiduForm;
      }
      case OCRType.Tesseract: {
        return TesseractForm;
      }
      default: return () => null;
    }
  }, [type]);

  const onClickMenuItem = (value: string) => {
    setType(value as OCRType);
  };

  return (
    <div className='settings-main-content settings-OCR'>
      <Menu
        mode='horizontal'
        theme={theme}
        selectedKeys={[type]}
        onClickMenuItem={onClickMenuItem}
        className='settings-main-content__menu'
      >
        {Object.entries(OCRType).map(([key, value]) => (
          <MenuItem key={value}>
            {key}
          </MenuItem>
        ))}
      </Menu>
      <FormComponent />
    </div>
  );
};
