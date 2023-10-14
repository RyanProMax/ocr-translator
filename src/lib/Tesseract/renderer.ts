import { createWorker } from 'tesseract.js';

export default class TesseractRenderer {
  async startOCR(image: base64): Promise<OCRResult> {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(image);
    return data.lines.map(line => line.text);
  }
}
