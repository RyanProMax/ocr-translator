import { useEffect, useRef } from 'react';
import { Rectangle, IpcRendererEvent } from 'electron/renderer';

import { ipcRenderer } from '../utils';
import { Channels } from 'src/common/constant';

export default () => {
  const boundsRef = useRef<Rectangle>();

  useEffect(() => {
    const updateBounds = (_: IpcRendererEvent, newBounds: Rectangle) => {
      // console.log(Channels.UpdateCaptureBounds, newBounds);
      boundsRef.current = newBounds;
    };

    ipcRenderer.on(Channels.UpdateCaptureBounds, updateBounds);

    return () => {
      ipcRenderer.removeListener(Channels.UpdateCaptureBounds, updateBounds);
    };
  }, []);

  return boundsRef;
};
