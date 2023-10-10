import { BrowserWindow, ipcMain } from 'electron';

import { logger } from '../utils/logger';
import { getHtmlPath, getPreloadPath } from '../utils/index';
import { Channels, Pages } from '../../common/constant';
import Controller from './Controller';

export default class MainWindow {
  logger = logger.scope('settings window');
  settingsWindow: BrowserWindow | null = null;
  controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  private createSettingsWindow() {
    const settingsWindow = new BrowserWindow({
      show: false,
      minWidth: 720,
      minHeight: 480,
      width: 720,
      height: 480,
      transparent: true,
      autoHideMenuBar: true,
      frame: false,
      webPreferences: {
        preload: getPreloadPath(),
        webSecurity: false,
      },
    });

    settingsWindow.loadURL(getHtmlPath(Pages.Settings));

    settingsWindow.on('ready-to-show', () => {
      settingsWindow.show();
    });

    return settingsWindow;
  }

  register() {
    ipcMain.on(Channels.OpenSettings, () => {
      this.logger.info(Channels.OpenSettings);
      const { mainWindow } = this.controller;
      mainWindow?.browserWindow.hide();
      this.settingsWindow = this.createSettingsWindow();

      ipcMain.once(Channels.CloseSettings, () => {
        this.logger.info(Channels.CloseSettings);

        if (this.settingsWindow) {
          this.settingsWindow.hide();
          this.settingsWindow.destroy();
          this.settingsWindow = null;
        }

        mainWindow?.browserWindow.show();
      });
    });
  }
}
