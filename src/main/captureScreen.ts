import {
  app, BrowserWindow, ipcMain, screen, desktopCapturer,
} from 'electron';
import path from 'path';
import fse from 'fs-extra';

import { Controller } from './controller';
import { logger } from './logger';
import { createWindow } from '../common/utils';
import { Channels, Pages } from '../common/constant';
import { clearInterval } from 'timers';

export default class CaptureScreen {
  controller: Controller;
  cropWindow: BrowserWindow | null = null;
  captureWindow: BrowserWindow | null = null;
  captured = false;
  cacheCapturePath = path.join(
    app.getPath('userData'),
    '/cache_capture',
  );
  captureImageName = 'capture_image.png';
  captureImageFullPath = path.join(
    this.cacheCapturePath,
    this.captureImageName
  );

  private loopTimer?: NodeJS.Timeout;

  logger = logger.scope('capture-screen');

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
    ipcMain.on(Channels.StartTranslation, (_, interval: number = 1000) => {
      this.logger.info(Channels.StartTranslation);
      this.clearLoopTimer();
      // start looper
      this.loopTimer = setInterval(async () => {
        const {
          captured, captureWindow,
          controller: { mainWindow }
        } = this;
        try {
          if (captured && captureWindow) {
            const filePath = await this.writeCaptureImage();
            if (!filePath) {
              throw new Error('Write image error');
            }
            mainWindow?.webContents.send(Channels.UpdateTranslation, {
              imagePath: filePath
            });
            this.logger.info('looper success', filePath);
          } else {
            throw new Error('Please capture screen first.');
          }
        } catch (e) {
          this.logger.info('looper error', e);
          mainWindow?.webContents.send(Channels.UpdateTranslation, {
            errorMessage: (e as any).message
          });
        }
      }, interval);
    });

    ipcMain.on(Channels.StopTranslation, this.clearLoopTimer);
  }

  async writeCaptureImage() {
    const { captureWindow } = this;
    if (captureWindow) {
      const bounds = captureWindow.getBounds();
      const targetScreen = screen.getDisplayMatching(bounds);

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: targetScreen.size,
      });
      const targetSource = sources.length > 1
        ? sources.find(s => s.display_id === String(targetScreen.id))
        : sources[0];
      if (!targetSource) {
        throw new Error('fail to find screen');
      }
      const buffer = targetSource.thumbnail.crop(bounds).toPNG();
      await fse.ensureDir(this.cacheCapturePath);
      await fse.writeFile(this.captureImageFullPath, buffer);
      return this.captureImageFullPath;
    }
    return null;
  }

  private clearLoopTimer() {
    this.logger.info('clearLoopTimer', this.loopTimer);
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
    }
  }
}
