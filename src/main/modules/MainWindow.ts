import { app, BrowserWindow } from 'electron';

// import { logger } from '../utils/logger';
import { getHtmlPath, getPreloadPath } from '../utils/index';
import { Channels, Pages } from '../../common/constant';

export default class MainWindow {
  // logger = logger.scope('main window');
  browserWindow = this.createMainWindow();

  constructor() {
    app.on('activate', () => {
      if (!this.browserWindow) {
        this.browserWindow = this.createMainWindow();
      }
    });
  }

  private createMainWindow() {
    const browserWindow = new BrowserWindow({
      show: false,
      minWidth: 360,
      minHeight: 160,
      width: 640,
      height: 240,
      transparent: true,
      autoHideMenuBar: true,
      frame: false,
      webPreferences: {
        preload: getPreloadPath(),
        webSecurity: false,
      },
    });

    browserWindow.loadURL(getHtmlPath(Pages.Home));

    browserWindow.on('ready-to-show', () => {
      browserWindow.show();
    });

    return browserWindow;
  }

  register() {
    this.browserWindow.on('will-resize', () => {
      this.browserWindow.webContents.send(Channels.Resize, true);
    });
  }
}
