import { useState } from 'react';
import TitleBar from './TitleBar';
import Sidebar, { MenuKey } from './Sidebar';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';
import usePackageJson from 'src/renderer/hooks/usePackageJson';

import './index.less';


export default () => {
  const packageJson = usePackageJson();
  const [collapse] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([MenuKey.OCR]);

  const onClickMenuItem = (key: string) => {
    setSelectedKeys([key as MenuKey]);
  };

  const onClose = () => {
    return ipcRenderer.send(Channels.CloseSettings);
  };

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
      </div>
    </div >
  );
};
