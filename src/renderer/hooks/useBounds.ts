import { useEffect } from 'react';
import { Rectangle, IpcRendererEvent } from 'electron/renderer';

import { ipcRenderer } from '../utils';
import { Channels } from 'src/common/constant';

export default (onUpdate: (newBounds: Rectangle) => void) => {
  useEffect(() => {
    const updateBounds = (_: IpcRendererEvent, newBounds: Rectangle) => {
      onUpdate(newBounds);
    };

    ipcRenderer.on(Channels.UpdateCaptureBounds, updateBounds);
    return () => {
      ipcRenderer.removeListener(Channels.UpdateCaptureBounds, updateBounds);
    };
  }, [onUpdate]);
};
