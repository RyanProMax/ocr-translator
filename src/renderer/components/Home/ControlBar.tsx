// import log from 'electron-log/renderer';
// const homeLogger = log.scope('home');

import classnames from 'classnames';
import { IconClose, IconPlayArrow } from '@arco-design/web-react/icon';
import IconScreenCapture from 'src/renderer/images/ScreenCapture.svg';
import IconSetting from 'src/renderer/images/Setting.svg';

import { Channels } from 'src/common/constant';
import { ipcRenderer } from 'src/renderer/utils';

export default ({ show }: {
  show: boolean
}) => {
  const onCrop = () => {
    return ipcRenderer.send(Channels.CropScreenShow);
  };

  const onClose = () => {
    return ipcRenderer.send(Channels.Quit);
  };

  const onStart = async () => {
    const result = await ipcRenderer.invoke(Channels.StartTranslation);
    console.log('result', result);
  };

  const onSetting = () => {

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
          <IconScreenCapture className='arco-icon' onClick={onCrop} />
        </div>
        <div title='start' className='home-control-bar__icon-wrapper'>
          <IconPlayArrow onClick={onStart} />
        </div>
        <div title='setting' className='home-control-bar__icon-wrapper'>
          <IconSetting className='arco-icon' onClick={onSetting} />
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
