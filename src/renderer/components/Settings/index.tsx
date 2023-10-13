import { FC, useMemo, useState } from 'react';
import Titlebar from './Titlebar';
import Sidebar, { MenuKey } from './Sidebar';
import Translator from './Translator';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';
import usePackageJson from 'src/renderer/hooks/usePackageJson';
import useDarkMode from 'src/renderer/hooks/useDarkMode';

import './index.less';
import OCR from './OCR';


export default () => {
  const { theme } = useDarkMode();
  const packageJson = usePackageJson();
  const [collapse] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([MenuKey.OCR]);

  const onClickMenuItem = (key: string) => {
    setSelectedKeys([key as MenuKey]);
  };

  const onClose = () => {
    return ipcRenderer.send(Channels.CloseSettings);
  };

  const MainContent = useMemo<FC>(() => {
    switch (selectedKeys[0]) {
      case MenuKey.OCR: {
        return OCR;
      }
      case MenuKey.Translator: {
        return Translator;
      }
      default: return () => null;
    }
  }, [selectedKeys]);

  return (
    <div className='settings'>
      <Titlebar
        title={`OCR Translator (ver ${packageJson?.version})`}
        onClose={onClose}
      />
      <div className='settings-content'>
        <Sidebar
          theme={theme}
          collapse={collapse}
          selectedKeys={selectedKeys}
          onClickMenuItem={onClickMenuItem}
        />
        <MainContent />
      </div>
    </div >
  );
};
