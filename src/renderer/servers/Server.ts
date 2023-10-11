import log from 'electron-log/renderer';
import { captureVideo } from '../utils';
import Baidu, { BaiduTranslatorLanguage } from './Baidu';

export enum OCRType {
  Baidu = 'Baidu',
  Local = 'Local',
}

export enum TranslatorType {
  Baidu = 'Baidu',
  Local = 'Local',
}

class Server {
  static instance: Server | null = null;
  logger = log.scope('server');

  ocrType = OCRType.Baidu;
  translatorType = TranslatorType.Baidu;

  BaiduServer = new Baidu();

  frame: base64 = '';

  private __START__ = false;
  private __TIMER__: number | null = null;

  startOCR() {
    switch (this.ocrType) {
      case OCRType.Baidu: {
        return this.BaiduServer.fetchOCR({
          image: this.frame,
        });
      }
      default: return [] as OCRResult;
    }
  }

  startTranslator(params: TranslatorParameter) {
    switch (this.ocrType) {
      case OCRType.Baidu: {
        return this.BaiduServer.fetchTranslator(params);
      }
      default: return [] as TranslatorResult;
    }
  }

  async start(): Promise<ServiceStartResult> {
    // OCR
    const ocrStartTime = Date.now();
    const ocrResult = await this.startOCR();
    const ocrCost = Date.now() - ocrStartTime;

    // Translator
    if (ocrResult.length > 0) {
      const translatorStartTime = Date.now();
      const translatorResult = await this.startTranslator({
        from: BaiduTranslatorLanguage.Auto,
        to: BaiduTranslatorLanguage.Chinese,
        strings: ocrResult
      });
      const translatorCost = Date.now() - translatorStartTime;

      return {
        ocrCost,
        translatorCost,
        result: translatorResult,
      };
    }

    return {
      ocrCost,
      translatorCost: 0,
      result: []
    };
  }

  async startLooper(params: LooperParameter) {
    const {
      video, timeout = 0, bounds,
      onSuccess = () => {},
      onError = () => {},
    } = params;
    try {
      this.__START__ = true;
      const startTime = Date.now();

      // capture frame
      const { base64 } = captureVideo({ video, bounds });
      this.frame = base64;
      const captureCost = Date.now() - startTime;

      const translatorResult = await server.start();
      const looperCost = Date.now() - startTime;

      if (this.__START__) {
        onSuccess({
          ...translatorResult,
          captureCost,
          looperCost,
        });

        if (timeout > 0) {
          this.clearTimer();
          this.__TIMER__ = window.setTimeout(() => {
            this.startLooper(params);
          }, timeout);
        }
      }
    } catch (e) {
      this.logger.error('startLooper error', e);
      onError((e as any).message);
    }
  }

  async stopLooper() {
    this.__START__ = false;
    this.clearTimer();
  }

  private clearTimer() {
    if (this.__TIMER__) {
      clearTimeout(this.__TIMER__);
      this.__TIMER__ = null;
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Server();
    }
    return this.instance;
  }
}

export const server = Server.getInstance();
