import { isEqual } from 'lodash-es';
import log from 'electron-log/renderer';
import { captureVideo } from '../utils';
import Baidu, { BaiduTranslatorLanguage } from 'src/lib/Baidu/renderer';
import TesseractRenderer from 'src/lib/Tesseract/renderer';

export enum OCRType {
  Baidu = 'Baidu',
  Tesseract = 'Tesseract',
}

export enum TranslatorType {
  None = 'None',
  Baidu = 'Baidu',
  Local = 'Local',
}

export type ServerConfig = {
  ocrType: OCRType
  translatorType: TranslatorType
  bounds: Rectangle
  video: HTMLVideoElement
}

class Server {
  static instance: Server | null = null;
  logger = log.scope('server');

  ocrType?: OCRType;
  translatorType?: TranslatorType;
  bounds?: Rectangle;
  video?: HTMLVideoElement;

  BaiduServer = new Baidu();
  TesseractServer = new TesseractRenderer();

  frame: base64 = '';

  private __PREV_STATE__: PrevState = {};
  private __START__ = false;
  private __TIMER__: number | null = null;

  async recognize() {
    if (!this.ocrType) {
      throw new Error('OCRType not defined');
    }
    const params = { image: this.frame };
    // simple diff
    if (isEqual(this.__PREV_STATE__.OCRParams, params)) {
      this.logger.info('repeat image, skip');
      return this.__PREV_STATE__.OCRResult!;
    }
    let result: OCRResult = [];
    switch (this.ocrType) {
      case OCRType.Baidu: {
        result = await this.BaiduServer.recognize(params);
        break;
      }
      case OCRType.Tesseract: {
        result = await this.TesseractServer.recognize(this.frame);
        break;
      }
      default: break;
    }
    this.__PREV_STATE__ = {
      ...this.__PREV_STATE__,
      OCRParams: params,
      OCRResult: result,
    };
    this.logger.info('OCR Result', result);
    return result;
  }

  async startTranslator(params: TranslatorParameter) {
    // simple diff
    if (isEqual(this.__PREV_STATE__.translatorParams, params)) {
      this.logger.info('repeat params, skip');
      return this.__PREV_STATE__.translatorResult!;
    }
    let result: TranslatorResult = [];
    switch (this.translatorType) {
      case TranslatorType.Baidu: {
        result = await this.BaiduServer.fetchTranslator(params);
        break;
      }
      default: break;
    }
    this.__PREV_STATE__ = {
      ...this.__PREV_STATE__,
      translatorParams: params,
      translatorResult: result,
    };
    this.logger.info('Translator Result', result);
    return result;
  }

  async start(): Promise<ServiceStartResult> {
    if (!this.video) {
      throw new Error('video not defined');
    }
    const startTime = Date.now();
    // capture frame
    const { base64 } = captureVideo({
      video: this.video,
      bounds: this.bounds
    });
    this.frame = base64;
    const captureCost = Date.now() - startTime;
    // OCR
    const ocrStartTime = Date.now();
    const ocrResult = await this.recognize();
    const ocrCost = Date.now() - ocrStartTime;

    // Translator
    if (this.translatorType !== TranslatorType.None && ocrResult.length > 0) {
      const translatorStartTime = Date.now();
      const translatorResult = await this.startTranslator({
        from: BaiduTranslatorLanguage.Auto,
        to: BaiduTranslatorLanguage.Chinese,
        strings: ocrResult
      });
      const translatorCost = Date.now() - translatorStartTime;

      return {
        captureCost,
        ocrCost,
        translatorCost,
        looperCost: Date.now() - startTime,
        result: translatorResult,
      };
    }

    return {
      captureCost,
      ocrCost,
      translatorCost: 0,
      looperCost: Date.now() - startTime,
      result: ocrResult
    };
  }

  async startLooper(params: LooperParameter) {
    const {
      timeout = 0,
      onSuccess = () => { },
      onError = () => { },
    } = params;
    try {
      this.__START__ = true;
      const startResult = await server.start();

      if (this.__START__) {
        onSuccess(startResult);

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

  update(serverConfig: Partial<ServerConfig>) {
    this.logger.info('update', serverConfig);
    const { ocrType, translatorType, bounds, video } = serverConfig;
    ocrType && (this.ocrType = ocrType);
    translatorType && (this.translatorType = translatorType);
    bounds && (this.bounds = bounds);
    video && (this.video = video);
  }

  stopLooper() {
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
