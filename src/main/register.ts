import { app, ipcMain } from 'electron';

import { createWindow } from '../common/utils';
import { Channels } from '../common/constant';
import { Controller } from './controller';
import { onDrag } from './drag';

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

  // show crop screen
  ipcMain.on(Channels.CropScreenShow, () => {
    controller.logger.info('crop area');
    const { cropWindow } = controller.captureScreen;
    if (cropWindow) {
      // reset crop area
      cropWindow.webContents.send(Channels.UpdateCropArea);
      // trigger after ipc event
      cropWindow.show();
    }
  });
  // hide crop screen
  ipcMain.on(Channels.CropScreenHide, () => {
    controller.logger.info('crop screen hide');
    controller.captureScreen.cropWindow?.hide();
  });
  ipcMain.on(Channels.CropScreenConfirm, (_, data) => {
    controller.logger.info('crop screen confirm', data);
    const { captureWindow } = controller.captureScreen;
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
  // broserWindow drag
  onDrag();
}
