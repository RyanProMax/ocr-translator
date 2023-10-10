import { FC, useMemo, useState } from 'react';
import TitleBar from './TitleBar';
import Sidebar, { MenuKey } from './Sidebar';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';
import usePackageJson from 'src/renderer/hooks/usePackageJson';
import useDarkMode from 'src/renderer/hooks/useDarkMode';

import './index.less';
import OCR from './OCR';


export default () => {
  useDarkMode();
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
      default: return () => null;
    }
  }, [selectedKeys]);

  return (
    <div className='settings'>
      <TitleBar
        title={`OCR Translator (ver ${packageJson?.version})`}
        onClose={onClose}
      />
      <div className='settings-content'>
        <Sidebar
          collapse={collapse}
          selectedKeys={selectedKeys}
          onClickMenuItem={onClickMenuItem}
        />
        <MainContent />
      </div>
    </div >
  );
};
