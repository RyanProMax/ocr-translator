import classnames from 'classnames';

import { IconClose, IconPlayArrow, IconLoading } from '@arco-design/web-react/icon';
import IconScreenCapture from 'src/renderer/images/ScreenCapture.svg';
import IconSetting from 'src/renderer/images/Setting.svg';
import IconStop from 'src/renderer/images/Stop.svg';
import { LooperStatus } from './constant';
import { useMemo } from 'react';

export enum Icon {
  ScreenCapture,
  TriggerStart,
  Settings,
  Close,
}

export default ({ show, looperStatus, onClickIcon }: {
  looperStatus: LooperStatus
  show: boolean
  onClickIcon: (type: Icon) => Promise<unknown>
}) => {
  const renderLooperIcon = useMemo(() => {
    const onClick = () => onClickIcon(Icon.TriggerStart);

    switch (looperStatus) {
      case LooperStatus.Loading: return (
        <IconLoading spin onClick={onClick} />
      );
      case LooperStatus.Running: return (
        <IconStop className='arco-icon__native' onClick={onClick} />
      );
      default: return (
        <IconPlayArrow onClick={onClick} />
      );
    }
  }, [looperStatus, onClickIcon]);

  const looperTitle = useMemo(() => {
    switch (looperStatus) {
      case LooperStatus.Loading: return 'loading';
      case LooperStatus.Running: return 'stop';
      default: return 'start';
    }
  }, [looperStatus]);

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
          <IconScreenCapture className='arco-icon__native' onClick={() => onClickIcon(Icon.ScreenCapture)} />
        </div>
        <div title={looperTitle} className='home-control-bar__icon-wrapper'>
          {renderLooperIcon}
        </div>
        <div title='setting' className='home-control-bar__icon-wrapper'>
          <IconSetting className='arco-icon__native' onClick={() => onClickIcon(Icon.Settings)} />
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
