import {
  BrowserWindow, ipcMain, screen, desktopCapturer,
} from 'electron';

import { logger } from './utils/logger';
import { getHtmlPath, getPreloadPath } from './utils';
import { Channels, Pages } from '../common/constant';

export default class CaptureScreen {
  logger = logger.scope('capture-screen');
  captured = false;
  cropWindow = this.createCropWindow();
  captureWindow = this.createCaptureWindow();

  register() {
    ipcMain.on(Channels.CropScreenShow, () => {
      this.logger.info(Channels.CropScreenShow);
      const { cropWindow } = this;
      if (cropWindow) {
        // reset crop area
        cropWindow.webContents.send(Channels.UpdateCropArea);
        cropWindow.show();
      }
    });

    ipcMain.on(Channels.CropScreenHide, () => {
      this.logger.info(Channels.CropScreenHide);
      this.cropWindow?.hide();
    });

    ipcMain.on(Channels.CropScreenConfirm, (_, data) => {
      this.logger.info(Channels.CropScreenConfirm, data);
      this.captureWindow.setBounds({
        width: Math.max(Math.ceil(data.width), 100),
        height: Math.max(Math.ceil(data.height), 100),
        x: Math.floor(data.x),
        y: Math.floor(data.y)
      }, false);
      this.captureWindow.show();
      this.captured = true;
    });

    ipcMain.handle(Channels.GetScreenSource, async () => {
      this.logger.info(Channels.GetScreenSource);
      const { captured, captureWindow } = this;
      try {
        if (captured && captureWindow) {
          const bounds = captureWindow.getBounds();
          const currentScreen = screen.getDisplayMatching(bounds);
          const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: currentScreen.size,
          });
          const targetSource = sources.length > 1
            ? sources.find(s => s.display_id === String(currentScreen.id))
            : sources[0];
          if (!targetSource) {
            throw new Error('fail to get screen');
          }
          return {
            data: {
              id: targetSource.id,
              bounds,
              currentScreen,
            }
          };
        } else {
          throw new Error('Please capture screen first.');
        }
      } catch (e) {
        this.logger.error('GetScreenSource error', e);
        return {
          errorMessage: (e as any).message
        };
      }
    });
  }

  private createCropWindow() {
    const cropWindow = new BrowserWindow({
      show: false,
      transparent: true,
      autoHideMenuBar: true,
      frame: false,
      resizable: false,
      fullscreen: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: getPreloadPath(),
        webSecurity: false,
      },
    });

    cropWindow.loadURL(getHtmlPath(Pages.CropScreen));
    return cropWindow;
  }

  private createCaptureWindow() {
    const captureWindow = new BrowserWindow({
      show: false,
      minWidth: 100,
      minHeight: 100,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      transparent: true,
      autoHideMenuBar: true,
      frame: false,
      resizable: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: getPreloadPath(),
        webSecurity: false,
      },
    });

    captureWindow.loadURL(getHtmlPath(Pages.Capture));
    return captureWindow;
  }
}
