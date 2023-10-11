import { useState } from 'react';

import { Channels } from 'src/common/constant';
import { ipcRenderer } from '../utils';

const sendDragEvent = (active: boolean) => {
  return ipcRenderer.send(Channels.Drag, active);
};

export default () => {
  const [cursorEnter, setCursorEnter] = useState(false);

  return {
    cursorEnter,
    setCursorEnter,
    mouseEvent: {
      onMouseEnter: () => setCursorEnter(true),
      onMouseLeave: () => setCursorEnter(false),
      onMouseDown: () => sendDragEvent(true),
      onMouseUp: () => sendDragEvent(false),
      onContextMenu: () => sendDragEvent(false),
    }
  };
}; 
