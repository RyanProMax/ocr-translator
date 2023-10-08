import { BrowserWindow } from 'electron';

import { createWindow } from '../common/utils';
import { Pages } from '../common/constant';
import { logger } from './logger';

export default class CaptureScreen {
  cropWindow: BrowserWindow | null = null;
  captureWindow: BrowserWindow | null = null;
  logger = logger.scope('capture-screen');

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
          resizable: true,
        },
        onReadyToShow: () => { },
      });
    } catch (e) {
      this.logger.error('init error', e);
    }
  }
}
