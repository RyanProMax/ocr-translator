import { isEqual, pick } from 'lodash-es';
import log from 'electron-log/renderer';

import { callApi, ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';

enum OCRType {
  Baidu = 'BaiduOCTSecret',
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
};

class OCR {
  static instance: OCR | null = null;

  type = OCRType.Baidu;
  logger = log.scope('ocr');

  private prevImage: string = '';
  private prevResult: OCRResult = [];

  get domain() {
    return Domain[this.type];
  }

  getSecret() {
    return ipcRenderer.invoke(Channels.GetUserStore, this.type);
  }

  async getAccessToken() {
    switch (this.type) {
      case OCRType.Baidu: {
        const secret: BaiduOCTSecret | null = await this.getSecret();
        if (!secret?.client_id || !secret.client_secret) {
          throw new Error('Please set secret first.');
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
        await ipcRenderer.invoke(Channels.SetUserStore, OCRType.Baidu, {
          ...secret,
          access_token,
        });
        return access_token as string;
      }
      default: return '';
    }
  }

  async fetchOCR(data: {
    image: string
    detect_direction?: boolean
    paragraph?: boolean
    probability?: boolean
  }): Promise<BaiduOCRResult[]> {
    switch (this.type) {
      case OCRType.Baidu: {
        let access_token: string = '';
        const secret: BaiduOCTSecret | null = await this.getSecret();
        if (!secret?.access_token) {
          access_token = await this.getAccessToken();
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
            access_token,
          },
          data: {
            detect_direction: false,
            paragraph: false,
            probability: false,
            ...data
          }
        });
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
