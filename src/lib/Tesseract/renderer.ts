import { Worker, createWorker } from 'tesseract.js';

export enum TesseractLanguage {
  English = 'eng'
}

export default class TesseractRenderer {
  worker?: Worker;
  language = TesseractLanguage.English;

  async recognize(image: base64): Promise<OCRResult> {
    if (!this.worker) {
      console.time('init worker');
      this.worker = await createWorker(this.language);
      console.timeEnd('init worker');
    }
    const { data } = await this.worker.recognize(image);
    return data.lines.map(line => line.text);
  }

  destroy() {
    return this.worker?.terminate();
  }
}
