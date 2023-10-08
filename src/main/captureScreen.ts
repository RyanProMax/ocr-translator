import {
  BrowserWindow, ipcMain, screen, desktopCapturer, Rectangle, Display,
} from 'electron';

import { Controller } from './controller';
import { logger } from './logger';
import { createWindow } from '../common/utils';
import { Channels, Pages } from '../common/constant';

export default class CaptureScreen {
  controller: Controller;
  cropWindow: BrowserWindow | null = null;
  captureWindow: BrowserWindow | null = null;
  captured = false;
  logger = logger.scope('capture-screen');

  private looperTimer: NodeJS.Timeout | null = null;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  init() {
    try {
      this.logger.info('init');

      this.cropWindow = createWindow({
        htmlFileName: Pages.CropScreen,
        browserWindowOptions: {
          resizable: false,
          fullscreen: true,
        },
        onReadyToShow: () => { },
      });

      this.captureWindow = createWindow({
        htmlFileName: Pages.Capture,
        browserWindowOptions: {
          minWidth: 100,
          minHeight: 100,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          resizable: true,
        },
        onReadyToShow: () => { },
      });
    } catch (e) {
      this.logger.error('init error', e);
    }
  }

  register() {
    // show crop screen
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
    // hide crop screen
    ipcMain.on(Channels.CropScreenHide, () => {
      logger.info('crop screen hide');
      this.cropWindow?.hide();
    });
    ipcMain.on(Channels.CropScreenConfirm, (_, data) => {
      logger.info('crop screen confirm', data);
      const { captureWindow } = this;
      if (captureWindow) {
        captureWindow.setBounds({
          width: Math.max(Math.ceil(data.width), 100),
          height: Math.max(Math.ceil(data.height), 100),
          x: Math.floor(data.x),
          y: Math.floor(data.y)
        }, false);
        captureWindow.show();
        this.captured = true;
      }
    });

    // Capture Image -> OCR -> Translation
    ipcMain.on(Channels.StartTranslation, async (_, interval: number = 200) => {
      this.logger.info(Channels.StartTranslation);
      console.log('trigger Channels.StartTranslation');

      const {
        captured, captureWindow,
        controller: { mainWindow }
      } = this;
      try {
        if (captured && captureWindow) {
          const bounds = captureWindow.getBounds();
          const currentScreen = screen.getDisplayMatching(bounds);
          this.looper({
            bounds,
            currentScreen,
            browserWindow: mainWindow!,
            interval
          });
        } else {
          throw new Error('Please capture screen first.');
        }
      } catch (e) {
        this.logger.error('looper error', e);
        mainWindow?.webContents.send(Channels.UpdateTranslation, {
          errorMessage: (e as any).message
        });
      }
    });

    ipcMain.on(Channels.StopTranslation, this.clearTimer);
  }

  async looper(params: {
    bounds: Rectangle
    currentScreen: Display
    browserWindow: BrowserWindow
    interval: number
  }) {
    const { bounds, currentScreen, browserWindow, interval } = params;
    try {
      const startTime = Date.now();
      this.clearTimer();
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
      const dataUrl = targetSource.thumbnail.crop(bounds).toDataURL();
      if (!dataUrl) {
        throw new Error('fail to get screenshot');
      }
      browserWindow.webContents.send(Channels.UpdateTranslation, {
        imagePath: dataUrl
      });
      this.looperTimer = setTimeout(() => {
        this.looper(params);
      }, interval);
      this.logger.info('looper success', `${Date.now() - startTime}ms`);
    } catch (e) {
      this.logger.error('looper error', e);
      browserWindow.webContents.send(Channels.UpdateTranslation, {
        errorMessage: (e as any).message
      });
    }
  }

  private clearTimer() {
    if (this.looperTimer) {
      clearTimeout(this.looperTimer);
      this.looperTimer = null;
    }
  }
}
