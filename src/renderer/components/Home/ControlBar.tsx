import { useMemo } from 'react';
import classnames from 'classnames';
import { Switch } from '@arco-design/web-react';
import {
  IconClose, IconLoading, IconRecordStop, IconPlayArrow
} from '@arco-design/web-react/icon';

import { LooperStatus } from './constant';

import IconScreenCapture from 'src/renderer/images/ScreenCapture.svg';
import IconSetting from 'src/renderer/images/Setting.svg';
import useDarkMode from 'src/renderer/hooks/useDarkMode';
import { Mode } from 'src/renderer/hooks/useMode';

export enum Icon {
  ScreenCapture,
  TriggerStart,
  Settings,
  Close,
  Switch,
}

export default ({ show, looperStatus, currentMode, onClickIcon }: {
  looperStatus: LooperStatus
  show: boolean
  currentMode: Mode
  onClickIcon: (type: Icon, ...args: unknown[]) => unknown
}) => {
  const { ThemeIcon, toggleTheme } = useDarkMode();

  const IconLooper = useMemo(() => {
    switch (looperStatus) {
      case LooperStatus.Loading: return IconLoading;
      case LooperStatus.Running: return IconRecordStop;
      default: return IconPlayArrow;
    }
  }, [looperStatus]);

  const looperTitle = useMemo(() => {
    switch (looperStatus) {
      case LooperStatus.Loading: return '加载中';
      case LooperStatus.Running: return '停止';
      default: return '开始';
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
        <div title='捕获画面' className='home-control-bar__item'>
          <IconScreenCapture className='arco-icon__native' onClick={() => onClickIcon(Icon.ScreenCapture)} />
        </div>
        <div title={looperTitle} className='home-control-bar__item'>
          <IconLooper onClick={() => onClickIcon(Icon.TriggerStart)} />
        </div>
        <div title='模式' className='home-control-bar__item'>
          <Switch
            checked={currentMode === Mode.Auto}
            checkedText='自动'
            uncheckedText='手动'
            className='arco-switch--mini'
            onChange={(val) => onClickIcon(Icon.Switch, val)}
          />
        </div>
        <div title='设置' className='home-control-bar__item'>
          <IconSetting className='arco-icon__native' onClick={() => onClickIcon(Icon.Settings)} />
        </div>
      </div>
      <div className='home-control-bar__right'>
        <div title='切换主题' className='home-control-bar__item'>
          <ThemeIcon onClick={toggleTheme} />
        </div>
        <div title='关闭' className='home-control-bar__item'>
          <IconClose onClick={() => onClickIcon(Icon.Close)} />
        </div>
      </div>
    </div>
  );
};
