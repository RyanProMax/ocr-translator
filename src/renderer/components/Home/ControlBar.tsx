import classnames from 'classnames';

import { IconClose, IconPlayArrow } from '@arco-design/web-react/icon';
import IconScreenCapture from 'src/renderer/images/ScreenCapture.svg';
import IconSetting from 'src/renderer/images/Setting.svg';

export enum Icon {
  ScreenCapture,
  Start,
  Setting,
  Close,
}

export default ({ show, onClickIcon }: {
  show: boolean
  onClickIcon: (type: Icon) => Promise<unknown>
}) => {
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
          <IconScreenCapture className='arco-icon' onClick={() => onClickIcon(Icon.ScreenCapture)} />
        </div>
        <div title='start' className='home-control-bar__icon-wrapper'>
          <IconPlayArrow onClick={() => onClickIcon(Icon.Start)} />
        </div>
        <div title='setting' className='home-control-bar__icon-wrapper'>
          <IconSetting className='arco-icon' onClick={() => onClickIcon(Icon.Setting)} />
        </div>
      </div>
      <div className='home-control-bar__right'>
        <div title='close' className='home-control-bar__icon-wrapper'>
          <IconClose onClick={() => onClickIcon(Icon.Close)} />
        </div>
      </div>
    </div>
  );
};
