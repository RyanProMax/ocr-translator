import TitleBar from './TitleBar';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';
import usePackageJson from 'src/renderer/hooks/usePackageJson';

import './index.less';

export default () => {
  const packageJson = usePackageJson();

  const onClose = () => {
    return ipcRenderer.send(Channels.CloseSettings);
  };

  return (
    <div className='settings'>
      <TitleBar
        title={`OCR Translator (ver ${packageJson.version})`}
        onClose={onClose}
      />
    </div >
  );
};
