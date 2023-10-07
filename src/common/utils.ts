import {
  app, BrowserWindow, BrowserWindowConstructorOptions,
} from 'electron';
import path from 'path';
import { URL } from 'url';
import merge from 'lodash/merge';

import { port } from './env';

export function getAssetPath(...paths: string[]): string {
  const resourcePath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  return path.join(resourcePath, ...paths);
}

export function getHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, './renderer/', htmlFileName)}`;
}

export function getPreloadPath(): string {
  return app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(process.cwd(), 'build/preload.js');
}

export const removeFileExtname = (fileName: string) => {
  return path.basename(fileName, path.extname(fileName));
};

export const createWindow = ({
  htmlFileName, minimize = false, browserWindowOptions = {},
  onReadyToShow, onClose = () => {}
}: {
  htmlFileName: string,
  minimize?: boolean,
  browserWindowOptions?: BrowserWindowConstructorOptions
  onReadyToShow?: () => unknown
  onClose?: () => unknown
}) => {
  const defaultOptions: BrowserWindowConstructorOptions = {
    show: false,
    width: 1024,
    height: 728,
    transparent: true,
    autoHideMenuBar: true,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: getPreloadPath(),
    },
  };
  const browserWindow = new BrowserWindow(
    merge(defaultOptions, browserWindowOptions)
  );

  browserWindow.loadURL(getHtmlPath(htmlFileName));

  browserWindow.on('ready-to-show', () => {
    if (onReadyToShow) {
      onReadyToShow();
    } else {
      if (minimize) {
        browserWindow.minimize();
      } else {
        browserWindow.show();
      }
    }
  });

  browserWindow.on('closed', onClose);

  return browserWindow;
};
