import { app, BrowserWindow } from 'electron';

import { createWindow } from '../common/utils';
import { registerBridge } from './register';
import CaptureScreen from './captureScreen';
// import { checkUpdate } from './updater';
import { logger } from './logger';
import { Pages } from '../common/constant';

export class Controller {
  mainWindow: BrowserWindow | null = null;
  captureScreen: CaptureScreen = new CaptureScreen(this);
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
      this.captureScreen.init();
      registerBridge(this);
      // checkUpdate();

      this.logger.info('app start success');
    } catch (e) {
      this.logger.error('app start error', e);
    }
  }
}
