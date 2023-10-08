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

  captureScreen.register();
}
