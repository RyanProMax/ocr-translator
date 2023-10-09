import {
  BrowserWindow, ipcMain, screen, desktopCapturer,
} from 'electron';

import { Controller } from './controller';
import { logger } from './logger';
import { createWindow } from '../common/utils';
import { Channels, Pages } from '../common/constant';

export default class CaptureScreen {
  controller: Controller;
  captured = false;
  logger = logger.scope('capture-screen');

  cropWindow: BrowserWindow = createWindow({
    htmlFileName: Pages.CropScreen,
    browserWindowOptions: {
      resizable: false,
      fullscreen: true,
      alwaysOnTop: true,
    },
    onReadyToShow: () => {},
  });

  captureWindow: BrowserWindow = createWindow({
    htmlFileName: Pages.Capture,
    browserWindowOptions: {
      minWidth: 100,
      minHeight: 100,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      resizable: true,
      alwaysOnTop: true,
    },
    onReadyToShow: () => {},
  });

  constructor(controller: Controller) {
    this.controller = controller;
  }

  register() {
    ipcMain.on(Channels.CropScreenShow, () => {
      logger.info('crop area');
      const { cropWindow } = this;
      if (cropWindow) {
        // reset crop area
        cropWindow.webContents.send(Channels.UpdateCropArea);
        // trigger after ipc event
        cropWindow.show();
      }
    });

    ipcMain.on(Channels.CropScreenHide, () => {
      logger.info('crop screen hide');
      this.cropWindow?.hide();
    });

    ipcMain.on(Channels.CropScreenConfirm, (_, data) => {
      logger.info('crop screen confirm', data);
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
}
