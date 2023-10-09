import { screen, ipcMain, BrowserWindow, IpcMainEvent } from 'electron';
import { Channels } from '../../common/constant';

// drag without use -webkit-app-region: drag;
export function onDrag(interval = 20) {
  let cursorPosition = { x: 0, y: 0 };
  let timer: NodeJS.Timeout | null = null;

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer!);
      timer = null;
    }
  };

  // move
  ipcMain.on(Channels.Drag, (event: IpcMainEvent, move: boolean) => {
    const { sender } = event;
    const browserWindow = BrowserWindow.fromWebContents(sender);

    if (browserWindow && move) {
      cursorPosition = screen.getCursorScreenPoint();
      const winBounds = browserWindow.getBounds();
      clearTimer();

      timer = setInterval(() => {
        // update broserWindow position
        const updateCursorPosition = screen.getCursorScreenPoint();
        const updateBounds = {
          ...winBounds,
          x: winBounds.x + updateCursorPosition.x - cursorPosition.x,
          y: winBounds.y + updateCursorPosition.y - cursorPosition.y,
        };
        browserWindow.setBounds(updateBounds);
      }, interval);
    } else {
      clearTimer();
    }
  });
}
