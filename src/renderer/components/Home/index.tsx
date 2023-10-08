// import log from 'electron-log/renderer';

import { useState } from 'react';
import classnames from 'classnames';

import useDrag from 'src/renderer/hooks/useDrag';
import ControlBar from './ControlBar';

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
  const [showControlBar, setShowControlBar] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowControlBar(true)}
      onMouseLeave={() => setShowControlBar(false)}
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
