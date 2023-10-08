import { Channels } from 'src/common/constant';

export default (active: boolean) => {
  return window.__ELECTRON__.ipcRenderer.send(Channels.Drag, active);
}; 
