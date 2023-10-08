// import log from 'electron-log/renderer';

import { useEffect, useState } from 'react';
import classnames from 'classnames';

import { ipcRenderer } from 'src/renderer/utils';
import useDrag from 'src/renderer/hooks/useDrag';
import ControlBar, { Icon } from './ControlBar';
import { Channels } from 'src/common/constant';

import './index.less';

// const homeLogger = log.scope('home');

const DEFAULT_TEXT = [
  { text: 'Welcome to  OCR Translator.', fontSize: 20 },
  { text: '1. click [capture screen] icon', fontSize: 16 },
  { text: '2. left click to select region, right click to confirm', fontSize: 16 },
  { text: '3. click [OCR]', fontSize: 16 },
];

export type Tips = {
  type: string
  message: string
}

export default () => {
  const [content] = useState(DEFAULT_TEXT);
  const [tips, setTips] = useState<Tips | null>(null);
  const [cursorEnter, setCursorEnter] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [start, setStart] = useState(false);
  const showControlBar = cursorEnter || isResize;

  const onClickIcon = async (type: Icon) => {
    switch (type) {
      case Icon.ScreenCapture: {
        return ipcRenderer.send(Channels.CropScreenShow);
      }
      case Icon.Start: {
        if (!start) {
          ipcRenderer.send(Channels.StartTranslation);
          setStart(true);
        }
        return;
      }
      case Icon.Close: {
        return ipcRenderer.send(Channels.Quit);
      }
      case Icon.Setting: {
        return;
      }
      default: return;
    }
  };

  useEffect(() => {
    const handleResize = (_: Electron.IpcRendererEvent, _isResize: boolean) => {
      console.log('handleResize', handleResize);
      setIsResize(_isResize);
    };

    ipcRenderer.on(Channels.Resize, handleResize);

    return () => {
      ipcRenderer.removeListener(Channels.Resize, handleResize);
    };
  }, []);

  useEffect(() => {
    if (start) {
      const updateTranslation = (
        _: Electron.IpcRendererEvent,
        data: UpdateTranslation
      ) => {
        console.log('handleResult', data);
        const { errorMessage, imagePath } = data;
        if (errorMessage) {
          setTips({ type: 'error', message: errorMessage });
        } else {
          setTips(null);
        }
      };

      ipcRenderer.on(Channels.UpdateTranslation, updateTranslation);

      return () => {
        ipcRenderer.removeListener(Channels.UpdateTranslation, updateTranslation);
      };
    }
  }, [start]);

  return (
    <div
      onMouseEnter={() => setCursorEnter(true)}
      onMouseLeave={() => setCursorEnter(false)}
      onMouseDown={() => useDrag(true)}
      onMouseUp={() => useDrag(false)}
      onContextMenu={() => useDrag(false)}
      className={classnames('home', {
        'home--show-control-bar': showControlBar
      })}
    >
      <ControlBar
        show={showControlBar}
        onClickIcon={onClickIcon}
      />
      <div className='home-content'>
        {content.map(({ text, fontSize }, idx) => (
          <span key={idx} className='home-content__item' style={{ fontSize }}>
            {text}
          </span>
        ))}
      </div>
      {tips?.message ? (
        <div className='home-footer'>
          {tips.message}
        </div>
      ) : null}
    </div>
  );
};
