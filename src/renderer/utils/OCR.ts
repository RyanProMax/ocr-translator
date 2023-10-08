import { isEqual } from 'lodash-es';
import log from 'electron-log/renderer';

import { OCR as OCR_SECRET } from 'src/renderer/utils/secret';
import { callApi } from 'src/renderer/utils';

export const enum OCRType {
  Baidu
}

export type BaiduOCRItem = {
  words: string
}

const Domain = {
  [OCRType.Baidu]: 'https://aip.baidubce.com',
};

class OCR {
  static instance: OCR | null = null;

  type = OCRType.Baidu;
  access_token: string = '';
  logger = log.scope('ocr');

  private prevImage: string = '';
  private prevResult: unknown;

  get domain() {
    return Domain[this.type];
  }

  // diy yourself here
  get secret() {
    return OCR_SECRET[this.type];
  }

  async getAccessToken() {
    switch (this.type) {
      case OCRType.Baidu: {
        const { API_KEY, SECRET_KEY } = this.secret;
        // https://console.bce.baidu.com/tools/#/api?product=AI&project=%E6%96%87%E5%AD%97%E8%AF%86%E5%88%AB&parent=%E9%89%B4%E6%9D%83%E8%AE%A4%E8%AF%81%E6%9C%BA%E5%88%B6&api=oauth%2F2.0%2Ftoken&method=post
        const { data: { access_token } } = await callApi({
          domain: this.domain,
          api: '/oauth/2.0/token',
          method: 'post',
          params: {
            grant_type: 'client_credentials',
            client_id: API_KEY,
            client_secret: SECRET_KEY
          }
        });
        this.access_token = access_token;
        return;
      }
      default: return;
    }
  }

  async fetchOCR(data: {
    image: string
    detect_direction?: boolean
    paragraph?: boolean
    probability?: boolean
  }) {
    if (!this.access_token) {
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
        access_token: this.access_token,
      },
      data: {
        detect_direction: false,
        paragraph: false,
        probability: false,
        ...data
      }
    });
    this.prevResult = resData.words_result;
    return resData.words_result;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OCR();
    }
    return this.instance;
  }
}

export const ocrInstance = OCR.getInstance();
