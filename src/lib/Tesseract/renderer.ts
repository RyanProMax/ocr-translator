import { Worker, createWorker } from 'tesseract.js';

export default class TesseractRenderer {
  worker?: Worker;

  async recognize(image: base64): Promise<OCRResult> {
    if (!this.worker) {
      console.time('init worker');
      this.worker = await createWorker('eng');
      console.timeEnd('init worker');
    }
    const { data } = await this.worker.recognize(image);
    return data.lines.map(line => line.text);
  }

  destroy() {
    return this.worker?.terminate();
  }
}
