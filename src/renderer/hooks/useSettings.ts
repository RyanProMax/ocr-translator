import { useEffect } from 'react';
import { IpcRendererEvent } from 'electron/renderer';

import { ipcRenderer } from '../utils';
import { Channels } from 'src/common/constant';
import { ServerConfig } from '../server';

export default (
  onUpdate: (_: IpcRendererEvent, serverConfig: Partial<ServerConfig>) => void
) => {
  useEffect(() => {
    ipcRenderer.on(Channels.UpdateSettings, onUpdate);
    return () => {
      ipcRenderer.removeListener(Channels.UpdateSettings, onUpdate);
    };
  }, [onUpdate]);
};
