import { Menu } from '@arco-design/web-react';
import {
  IconScan, IconTranslate, IconInfoCircle
} from '@arco-design/web-react/icon';
import { THEME } from 'src/renderer/hooks/useDarkMode';

const MenuItem = Menu.Item;

export enum MenuKey {
  OCR = 'OCR',
  Translator = 'Translator',
  About = 'About',
}

export const SettingsMenu = [
  {
    key: MenuKey.OCR,
    Component: <>
      <IconScan /> OCR
    </>
  },
  {
    key: MenuKey.Translator,
    Component: <>
      <IconTranslate /> Translator
    </>
  },
  {
    key: MenuKey.About,
    Component: <>
      <IconInfoCircle /> About
    </>
  },
];


export default ({
  collapse, selectedKeys, theme,
  onClickMenuItem
}: {
  theme: THEME
  collapse: boolean
  selectedKeys: string[]
  onClickMenuItem: (key: string) => unknown
}) => {
  return (
    <Menu
      theme={theme}
      collapse={collapse}
      selectedKeys={selectedKeys}
      onClickMenuItem={onClickMenuItem}
      className='settings-menu'
    >
      {SettingsMenu.map(item => (
        <MenuItem key={item.key}>
          {item.Component}
        </MenuItem>
      ))}
    </Menu>
  );
};
