import { app, ipcMain } from 'electron';
import path from 'path';
import { exec } from 'child_process';

import { Channels } from '../../common/constant';

export default class TesseractMain {
  private tempDir = app.getPath('temp');

  register() {
    ipcMain.handle(Channels.TesseractProcess, (_, image, options) => {
      return this.process(image, options);
    });
  }

  async process(image: string, options: TesseractProcessOptions) {
    const output = path.resolve(this.tempDir, 'tesseract-output');
    const command = [options?.binary, image, output];

    options.l && command.push(`-l ${options.l}`);
    Number.isInteger(options.psm) && command.push(`-psm ${options.psm}`);
    options.config && command.push(options.config);

    const commandStr = command.join(' ');
    console.log('commandStr', commandStr);

    exec(commandStr, {}, (err) => {
      if (err) {
        console.log('exec error', err);
        return;
      }
    });
  }
}
