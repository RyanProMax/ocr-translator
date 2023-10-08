import { app, ipcMain } from 'electron';

import { createWindow } from '../common/utils';
import { Channels } from '../common/constant';
import { Controller } from './controller';
import { onDrag } from './drag';

export function registerBridge(controller: Controller) {
  const { mainWindow, logger, captureScreen } = controller;

  // app handler
  ipcMain.handle(
    Channels.CreateWindow,
    async (_, ...args: Parameters<typeof createWindow>) =>
      Boolean(createWindow(args[0]))
  );
  ipcMain.on(Channels.Quit, () => {
    logger.info('app quit');
    app.quit();
  });

  // show crop screen
  ipcMain.on(Channels.CropScreenShow, () => {
    logger.info('crop area');
    const { cropWindow } = captureScreen;
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
    captureScreen.cropWindow?.hide();
  });
  ipcMain.on(Channels.CropScreenConfirm, (_, data) => {
    logger.info('crop screen confirm', data);
    const { captureWindow } = captureScreen;
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

  // resize
  if (mainWindow) {
    mainWindow.on('will-resize', () => {
      mainWindow.webContents.send(Channels.Resize, true);

      mainWindow.once('resized', () => {
        mainWindow.webContents.send(Channels.Resize, false);
      });
    });
  }
}
