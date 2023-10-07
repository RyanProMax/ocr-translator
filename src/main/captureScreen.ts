import {
  BrowserWindow, BrowserWindowConstructorOptions
} from 'electron';

import { createWindow } from '../common/utils';
import { Pages } from '../common/constant';
import { logger } from './logger';

export default class CaptureScreen {
  captureWindow: BrowserWindow | null = null;
  logger = logger.scope('capture');

  async init() {
    try {
      this.logger.info('init capture');
      const browserWindowOptions: BrowserWindowConstructorOptions = {
        resizable: false,
        fullscreen: true,
      };

      this.captureWindow = createWindow({
        htmlFileName: Pages.Capture,
        browserWindowOptions,
        onReadyToShow: () => {},
      });
    } catch (e) {
      this.logger.error('init capture error', e);
    }
  }

  show() {
    return this.captureWindow?.show();
  }

  hide() {
    return this.captureWindow?.hide();
  }
}
