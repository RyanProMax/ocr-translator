import { pick } from 'lodash-es';
import log from 'electron-log/renderer';

import { callApi, ipcRenderer } from 'src/renderer/utils';
import { Channels } from 'src/common/constant';

enum TranslationType {
  Baidu = 'BaiduTranslationSecret',
}

interface BaiduTranslationSecret {
  client_id?: string
  client_secret?: string
  access_token?: string
}

enum Language {
  Auto = 'auto',
  English = 'en',
  Chinese = 'zh',
}

type BaiduTransResult = {
  src: string
  dst: string
}

const Domain = {
  [TranslationType.Baidu]: 'https://aip.baidubce.com',
};

class Translation {
  static instance: Translation | null = null;

  type = TranslationType.Baidu;
  logger = log.scope('translation');

  get domain() {
    return Domain[this.type];
  }

  getSecret() {
    return ipcRenderer.invoke(Channels.GetUserStore, this.type);
  }

  async getAccessToken() {
    switch (this.type) {
      case TranslationType.Baidu: {
        const secret: BaiduTranslationSecret | null = await this.getSecret();
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
        await ipcRenderer.invoke(Channels.SetUserStore, TranslationType.Baidu, {
          ...secret,
          access_token,
        });
        return access_token as string;
      }
      default: return '';
    }
  }

  async fetchTranslation(data: {
    q: string
    from?: string
    to?: string
  }) {
    switch (this.type) {
      case TranslationType.Baidu: {
        let access_token: string = '';
        const secret: BaiduTranslationSecret | null = await this.getSecret();
        if (!secret?.access_token) {
          access_token = await this.getAccessToken();
        }
        const { data: resData } = await callApi({
          domain: this.domain,
          headers: {
            ['Content-Type']: 'application/json'
          },
          api: '/rpc/2.0/mt/texttrans/v1',
          method: 'post',
          params: {
            access_token,
          },
          data: {
            from: Language.Auto,
            to: Language.Chinese,
            ...data
          }
        });
        return resData.result.trans_result as BaiduTransResult[];
      }
      default: return [];
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Translation();
    }
    return this.instance;
  }
}

export const translation = Translation.getInstance();
