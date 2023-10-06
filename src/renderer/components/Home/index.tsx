// import log from 'electron-log/renderer';

import { useState } from 'react';

import ControlBar from './ControlBar';

import './index.scss';

// const homeLogger = log.scope('home');

export default () => {
  const [content] = useState('Welcome to  OCR Translator.');
  const [tips] = useState('');

  return (
    <div className='home'>
      <ControlBar show />
      <div className='home-content'>
        {content}
      </div>
      {tips ? (
        <div className='home-footer'>
          {tips}
        </div>
      ) : null}
    </div>
  );
};
