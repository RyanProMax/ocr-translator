import { app, ipcMain } from 'electron';

import { createWindow } from '../common/utils';
import { Channels } from '../common/constant';
import { Controller } from './controller';

export function registerBridge(controller: Controller) {
  ipcMain.handle(
    Channels.CreateWindow,
    async (_, ...args: Parameters<typeof createWindow>) =>
      Boolean(createWindow(args[0]))
  );
  ipcMain.on(Channels.CaptureArea, () => {
    controller.logger.info('capture area');
    controller.captureScreen.show();
  });
  ipcMain.on(Channels.CaptureAreaCancel, () => {
    controller.logger.info('capture area cancel');
    controller.captureScreen.hide();
  });
  ipcMain.on(Channels.Quit, () => {
    controller.logger.info('app quit');
    app.quit();
  });
}
