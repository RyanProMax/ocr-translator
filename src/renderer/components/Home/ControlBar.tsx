// import log from 'electron-log/renderer';
// const homeLogger = log.scope('home');

import classnames from 'classnames';
import { IconFullscreen, IconClose } from '@arco-design/web-react/icon';

import { Channels } from 'src/common/constant';

export default ({ show }: {
  show: boolean
}) => {
  const onCrop = () => {
    return window.__ELECTRON__.ipcRenderer.send(Channels.CropScreenShow);
  };

  const onClose = () => {
    return window.__ELECTRON__.ipcRenderer.send(Channels.Quit);
  };

  return (
    <div
      className={classnames('home-control-bar', {
        'home-control-bar--hidden': !show
      })}
    >
      <div className='home-control-bar__left'>
      </div>
      <div className='home-control-bar__center'>
        <div title='capture screen' className='home-control-bar__icon-wrapper'>
          <IconFullscreen onClick={onCrop} />
        </div>
      </div>
      <div className='home-control-bar__right'>
        <div title='close' className='home-control-bar__icon-wrapper'>
          <IconClose onClick={onClose} />
        </div>
      </div>
    </div>
  );
};
