// import log from 'electron-log/renderer';

import { useEffect, useState } from 'react';
import classnames from 'classnames';

import useDrag from 'src/renderer/hooks/useDrag';
import ControlBar from './ControlBar';
import { Channels } from 'src/common/constant';

import './index.less';

// const homeLogger = log.scope('home');

const DEFAULT_TEXT = [
  { text: 'Welcome to  OCR Translator.', fontSize: 20 },
  { text: '1. click [capture screen] icon', fontSize: 16 },
  { text: '2. left click to select region, right click to confirm', fontSize: 16 },
  { text: '3. click [OCR]', fontSize: 16 },
];

export default () => {
  const [content] = useState(DEFAULT_TEXT);
  const [tips] = useState('');
  const [cursorEnter, setCursorEnter] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const showControlBar = cursorEnter || isResize;

  useEffect(() => {
    const handleResize = (_: Electron.IpcRendererEvent, _isResize: boolean) => {
      console.log('handleResize', handleResize);
      setIsResize(_isResize);
    };

    window.__ELECTRON__.ipcRenderer.on(Channels.Resize, handleResize);

    return () => {
      window.__ELECTRON__.ipcRenderer.removeListener(Channels.Resize, handleResize);
    };
  }, []);


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
      <ControlBar show={showControlBar} />
      <div className='home-content'>
        {content.map(({ text, fontSize }, idx) => (
          <span key={idx} className='home-content__item' style={{ fontSize }}>
            {text}
          </span>
        ))}
      </div>
      {tips ? (
        <div className='home-footer'>
          {tips}
        </div>
      ) : null}
    </div>
  );
};
