import { app, BrowserWindow } from 'electron';

import OTStore from './store';
import CaptureScreen from './captureScreen';
import { createWindow } from '../common/utils';
import { registerBridge } from './register';
// import { checkUpdate } from './updater';
import { logger } from './logger';
import { Pages } from '../common/constant';

export class Controller {
  mainWindow: BrowserWindow | null = null;
  captureScreen: CaptureScreen | null = null;
  store: OTStore | null = null;
  logger = logger.scope('controller');

  async startApp() {
    try {
      this.logger.info('app start');

      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });

      app.on('activate', () => {
        if (this.mainWindow === null) {
          this.mainWindow = createWindow({
            htmlFileName: Pages.Home,
            onClose: () => {
              this.mainWindow = null;
            }
          });
        }
      });

      await app.whenReady();

      this.mainWindow = createWindow({
        htmlFileName: Pages.Home,
        browserWindowOptions: {
          minWidth: 360,
          minHeight: 160,
          width: 720,
          height: 160,
        },
        onClose: () => {
          this.mainWindow = null;
        }
      });

      this.captureScreen = new CaptureScreen(this);
      this.store = new OTStore();
      registerBridge(this);
      this.captureScreen.register();
      this.store.register();
      // checkUpdate();

      this.logger.info('app start success');
    } catch (e) {
      this.logger.error('app start error', e);
    }
  }
}
