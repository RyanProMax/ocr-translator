import { merge } from 'lodash-es';
import log from 'electron-log/renderer';

import { ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';

export default class TesseractRenderer {
  private logger = log.scope('Tesseract');
  private prevState: PrevState = {};
  private defaultOptions: TesseractProcessOptions = {
    l: 'eng',
    psm: 3,
    config: '',
    binary: 'C:\\Program Files\\Tesseract-OCR\\tesseract',
  };

  process(image: string, options?: TesseractProcessOptions) {
    const _options = merge(this.defaultOptions, options);
    return ipcRenderer.invoke(Channels.TesseractProcess, image, _options);
  }
}
