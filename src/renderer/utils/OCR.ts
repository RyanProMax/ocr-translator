import { isEqual, pick } from 'lodash-es';
import log from 'electron-log/renderer';

import { callApi, ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';
import { BaiduStatusCode } from './constant';

export enum OCRType {
  Baidu = 'BaiduOCTSecret',
  Local = 'LocalOTSecret',
}

interface BaiduOCTSecret {
  client_id?: string
  client_secret?: string
  access_token?: string
}

type BaiduOCRResult = {
  words: string
}

type OCRResult = BaiduOCRResult[];

const Domain = {
  [OCRType.Baidu]: 'https://aip.baidubce.com',
  [OCRType.Local]: '',
};

class OCR {
  static instance: OCR | null = null;

  type = OCRType.Baidu;
  logger = log.scope('ocr');
  accessToken = '';

  private prevImage: string = '';
  private prevResult: OCRResult = [];

  get domain() {
    return Domain[this.type];
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    return this.setSecretValue('access_token', token);
  }

  getSecret() {
    return ipcRenderer.invoke(Channels.GetUserStore, this.type);
  }

  setSecret(value: unknown) {
    return ipcRenderer.invoke(Channels.SetUserStore, this.type, value);
  }

  async setSecretValue(key: string, value: unknown) {
    const prevSecret = await this.getSecret();
    return ipcRenderer.invoke(Channels.SetUserStore, this.type, {
      ...prevSecret,
      [key]: value,
    });
  }

  async getAccessToken() {
    if (!this.accessToken) {
      switch (this.type) {
        case OCRType.Baidu: {
          const secret: BaiduOCTSecret | null = await this.getSecret();
          if (!secret?.client_id || !secret.client_secret) {
            throw new Error('Please set OCR secret first.');
          }
          // https://console.bce.baidu.com/tools/#/api?product=AI&project=%E6%96%87%E5%AD%97%E8%AF%86%E5%88%AB&parent=%E9%89%B4%E6%9D%83%E8%AE%A4%E8%AF%81%E6%9C%BA%E5%88%B6&api=oauth%2F2.0%2Ftoken&method=post
          const { data: { access_token } } = await callApi({
            domain: this.domain,
            api: '/oauth/2.0/token',
            method: 'post',
            params: {
              grant_type: 'client_credentials',
              ...pick(secret, ['client_id', 'client_secret']),
            }
          });
          await this.setAccessToken(access_token);
          break;
        }
        default: break;
      }
    }
    return this.accessToken;
  }

  async fetchOCR(data: {
    image: string
    detect_direction?: boolean
    paragraph?: boolean
    probability?: boolean
  }): Promise<BaiduOCRResult[]> {
    switch (this.type) {
      case OCRType.Baidu: {
        if (!this.accessToken) {
          await this.getAccessToken();
        }
        // simple diff
        if (isEqual(this.prevImage, data.image)) {
          this.logger.info('repeat image, skip');
          return this.prevResult;
        }
        const { data: resData } = await callApi({
          domain: this.domain,
          api: '/rest/2.0/ocr/v1/general_basic',
          method: 'post',
          params: {
            access_token: this.accessToken,
          },
          data: {
            detect_direction: false,
            paragraph: false,
            probability: false,
            ...data
          }
        });
        if (resData.error_msg) {
          if ([
            BaiduStatusCode.AccessTokenInvalid,
            BaiduStatusCode.AccessTokenExpired,
          ].includes(resData.error_code)) {
            this.setAccessToken('');
          }
          throw new Error(resData.error_msg);
        }
        this.prevResult = resData.words_result as BaiduOCRResult[];
        return this.prevResult;
      }
      default: return [];
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OCR();
    }
    return this.instance;
  }
}

export const ocrInstance = OCR.getInstance();
