// import log from 'electron-log/renderer';
// const homeLogger = log.scope('home');

import classnames from 'classnames';
import { IconFullscreen, IconClose } from '@arco-design/web-react/icon';

import { Channels } from 'src/common/constant';

export default ({ show }: {
  show: boolean
}) => {
  const onCapture = () => {
    return window.__ELECTRON__.ipcRenderer.send(Channels.CaptureArea);
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
        <IconFullscreen onClick={onCapture} />
      </div>
      <div className='home-control-bar__right'>
        <IconClose onClick={onClose} />
      </div>
    </div>
  );
};
