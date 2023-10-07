import { app, BrowserWindow, ipcMain } from 'electron';

import { createWindow } from '../common/utils';
import { Channels, Pages } from '../common/constant';
import { logger } from './logger';
// import { checkUpdate } from './updater';

export class Controller {
  mainWindow: BrowserWindow | null = null;
  logger = logger.scope('controller');

  async startApp() {
    try {
      this.logger.info('app start');

      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });

      this.register();
      await app.whenReady();
      // checkUpdate();

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
      this.logger.info('app start success');
    } catch (e) {
      this.logger.error('app start error', e);
    }
  }

  register() {
    ipcMain.handle(Channels.CreateWindow, async (_, ...args: Parameters<typeof createWindow>) => {
      return Boolean(createWindow(args[0]));
    });
    ipcMain.on(Channels.Quit, () => {
      this.logger.info('app quit');
      app.quit();
    });
  }
}
