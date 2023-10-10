import { useState } from 'react';
import { Menu } from '@arco-design/web-react';
import TitleBar from './TitleBar';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';
import usePackageJson from 'src/renderer/hooks/usePackageJson';
import { MenuKey, SettingsMenu } from './constant';

import './index.less';

const MenuItem = Menu.Item;


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
        title={`OCR Translator (ver ${packageJson.version})`}
        onClose={onClose}
      />
      <div className='settings-content'>
        <Menu
          theme='dark'
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
      </div>
    </div >
  );
};
