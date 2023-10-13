import { useState } from 'react';
import { Button } from '@arco-design/web-react';
import classnames from 'classnames';

import useDrag from 'src/renderer/hooks/useDrag';

import './index.less';
import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';

export default () => {
  const { mouseEvent, setCursorEnter } = useDrag();
  const [showContent, setShowContent] = useState(false);

  const hideCaptureWindow = () => {
    ipcRenderer.send(Channels.HideCaptureWindow);
  };

  return (
    <div
      {...mouseEvent}
      onMouseEnter={() => {
        setCursorEnter(true);
        setShowContent(true);
      }}
      onMouseLeave={() => {
        setCursorEnter(false);
        setShowContent(false);
      }}
      className='capture-screen'
    >
      <Button
        type='primary'
        size='mini'
        onClick={hideCaptureWindow}
        className={classnames('capture-screen__button', {
          'capture-screen__button--hidden': !showContent
        })}
      >
        Hide
      </Button>
    </div>
  );
};
