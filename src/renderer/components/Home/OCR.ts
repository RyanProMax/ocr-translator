import { baidu } from 'src/common/secret';

import log from 'electron-log/renderer';
import { callApi } from 'src/renderer/utils';

export const enum OCRType {
  Baidu
}

const Domain = {
  [OCRType.Baidu]: 'https://aip.baidubce.com',
};

class OCR {
  static instance: OCR | null = null;

  type = OCRType.Baidu;
  access_token: string = '';
  logger = log.scope('ocr');

  get domain() {
    return Domain[this.type];
  }

  // diy yourself here
  get secret() {
    return baidu;
  }

  async getAccessToken() {
    switch (this.type) {
      case OCRType.Baidu: {
        const { API_KEY, SECRET_KEY } = this.secret;
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
    const startTime = Date.now();
    if (!this.access_token) {
      await this.getAccessToken();
    }
    const response = await callApi({
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
    console.log(`fetchOCR data, ${Date.now() - startTime}ms`, response.data);
    return response.data.words_result;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OCR();
    }
    return this.instance;
  }
}

export const ocrInstance = OCR.getInstance();
