import { Channels } from 'src/common/constant';
import { ipcRenderer } from '../utils';

export default (active: boolean) => {
  return ipcRenderer.send(Channels.Drag, active);
}; 
