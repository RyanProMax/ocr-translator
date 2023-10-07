import { app, ipcMain } from 'electron';

import { createWindow } from '../common/utils';
import { Channels } from '../common/constant';
import { Controller } from './controller';

export function registerBridge(controller: Controller) {
  // app handler
  ipcMain.handle(
    Channels.CreateWindow,
    async (_, ...args: Parameters<typeof createWindow>) =>
      Boolean(createWindow(args[0]))
  );
  ipcMain.on(Channels.Quit, () => {
    controller.logger.info('app quit');
    app.quit();
  });

  // crop screen
  ipcMain.on(Channels.CropScreen, () => {
    controller.logger.info('crop area');
    controller.captureScreen.cropWindow?.show();
  });
  ipcMain.on(Channels.CropScreenCancel, () => {
    controller.logger.info('crop area cancel');
    controller.captureScreen.cropWindow?.hide();
  });
  ipcMain.on(Channels.CropScreenConfirm, (_, data) => {
    controller.logger.info('crop area confirm', data);
    const { cropWindow, captureWindow } = controller.captureScreen;
    cropWindow?.hide();
    if (captureWindow) {
      captureWindow.setBounds({
        width: Math.max(Math.ceil(data.width), 100),
        height: Math.max(Math.ceil(data.height), 100),
        x: Math.floor(data.x),
        y: Math.floor(data.y)
      }, false);
      captureWindow.show();
    }
  });
}
