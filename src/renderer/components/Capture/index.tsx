import { Channels } from 'src/common/constant';

import './index.less';

export default () => {
  const onCancel = () => {
    return window.__ELECTRON__.ipcRenderer.send(Channels.CaptureAreaCancel);
  };

  const handleClick = () => {
    return onCancel();
  };


  return (
    <div
      onContextMenu={onCancel}
      onClick={handleClick}
      className='capture'
    >

    </div >
  );
};
