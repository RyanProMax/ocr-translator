import { IconRobot, IconTranslate, IconInfoCircle } from '@arco-design/web-react/icon';

export enum MenuKey {
  OCR = 'OCR',
  Translator = 'Translator',
  About = 'About',
}

export const SettingsMenu = [
  {
    key: MenuKey.OCR,
    Component: <>
      <IconRobot /> OCR
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
