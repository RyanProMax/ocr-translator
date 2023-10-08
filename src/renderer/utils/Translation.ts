import log from 'electron-log/renderer';

import { Translation as TranslationSecret } from 'src/renderer/utils/secret';
import { callApi } from 'src/renderer/utils';

export const enum TranslationType {
  Baidu
}

export const enum Language {
  Auto = 'auto',
  English = 'en',
  Chinese = 'zh',
}

export type BaiduTransResult = {
  src: string
  dst: string
}

const Domain = {
  [TranslationType.Baidu]: 'https://aip.baidubce.com',
};

class Translation {
  static instance: Translation | null = null;

  type = TranslationType.Baidu;
  access_token: string = '';
  logger = log.scope('translation');

  get domain() {
    return Domain[this.type];
  }

  // diy yourself here
  get secret() {
    return TranslationSecret[this.type];
  }

  async getAccessToken() {
    switch (this.type) {
      case TranslationType.Baidu: {
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

  async fetchTranslation(data: {
    q: string
    from?: string
    to?: string
  }) {
    if (!this.access_token) {
      await this.getAccessToken();
    }
    const { data: resData } = await callApi({
      domain: this.domain,
      headers: {
        ['Content-Type']: 'application/json'
      },
      api: '/rpc/2.0/mt/texttrans/v1',
      method: 'post',
      params: {
        access_token: this.access_token,
      },
      data: {
        from: Language.Auto,
        to: Language.Chinese,
        ...data
      }
    });
    return resData.result;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Translation();
    }
    return this.instance;
  }
}

export const translation = Translation.getInstance();
