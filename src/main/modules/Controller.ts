import { app, ipcMain } from 'electron';

import MainWindow from './MainWindow';
import Store from './Store';
import CaptureScreen from './CaptureScreen';
import Settings from './Settings';

// import { checkUpdate } from './updater';
import { logger } from '../utils/logger';
import { Channels } from '../../common/constant';
import { onDrag } from '../utils/drag';
import { getPackageJson } from '../utils';

export default class Controller {
  logger = logger.scope('controller');

  mainWindow: MainWindow | null = null;
  captureScreen: CaptureScreen | null = null;
  settings: Settings | null = null;
  store: Store | null = null;

  async startApp() {
    try {
      this.logger.info('app start');

      this.registerAppEvent();
      await app.whenReady();

      this.mainWindow = new MainWindow();
      this.captureScreen = new CaptureScreen();
      this.settings = new Settings(this);
      this.store = new Store();

      // ensure run after initial MainWindow/CaptureScreen/Store
      this.registerMainEvent();

      // checkUpdate();

      this.logger.info('app start success');
    } catch (e) {
      this.logger.error('app start error', e);
    }
  }

  private registerAppEvent() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  private registerMainEvent() {
    ipcMain.on(Channels.Quit, () => {
      this.logger.info('app quit');
      app.quit();
    });

    ipcMain.handle(Channels.GetPackageJson, getPackageJson);

    // drag event
    onDrag();

    // window event
    this.mainWindow?.register();
    this.captureScreen?.register();
    this.settings?.register();

    // store event
    this.store?.register();
  }
}
