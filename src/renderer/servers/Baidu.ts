import { isEqual, pick } from 'lodash-es';
import log from 'electron-log/renderer';

import { callApi, getUserStore, setUserStore } from 'src/renderer/utils';

export enum BaiduApp {
  OCR = 'BaiduOCRSecret',
  Translator = 'BaiduTranslatorSecret',
}

export enum BaiduTranslatorLanguage {
  Auto = 'auto',
  English = 'en',
  Chinese = 'zh',
}

export enum BaiduStatusCode {
  AccessTokenInvalid = 110,
  AccessTokenExpired = 111,
}

export default class Baidu {
  private logger = log.scope('Baidu');
  private domain = 'https://aip.baidubce.com';
  private accessToken: Record<BaiduApp, string> = {
    [BaiduApp.OCR]: '',
    [BaiduApp.Translator]: ''
  };
  private prevState: {
    OCRParams: OCRParameter | null,
    OCRResult: OCRResult
    translatorParams: TranslatorParameter | null
    translatorResult: TranslatorResult
  } = {
      OCRParams: null,
      OCRResult: [],
      translatorParams: null,
      translatorResult: [],
    };

  private getSecret(appKey: BaiduApp): Promise<BaiduOCRSecret | null> {
    return getUserStore(appKey);
  }

  private setAccessToken(appKey: BaiduApp, token: string) {
    this.accessToken[appKey] = token;
    return this.setSecretValue(appKey, { access_token: token });
  }

  private async setSecretValue(appKey: BaiduApp, updateValue: BaiduOCRSecret) {
    const prevValue = await this.getSecret(appKey);
    return setUserStore(appKey, {
      ...prevValue,
      ...updateValue,
    });
  }

  private async getAccessToken(appKey: BaiduApp) {
    if (!this.accessToken[appKey]) {
      const secret = await this.getSecret(appKey);
      if (!secret?.client_id || !secret.client_secret) {
        throw new Error(`Please set ${appKey} first.`);
      }
      // https://console.bce.baidu.com/tools/#/api?product=AI&project=%E6%96%87%E5%AD%97%E8%AF%86%E5%88%AB&parent=%E9%89%B4%E6%9D%83%E8%AE%A4%E8%AF%81%E6%9C%BA%E5%88%B6&api=oauth%2F2.0%2Ftoken&method=post
      const { access_token }: BaiduAccessTokenResponseData = await callApi({
        domain: this.domain,
        api: '/oauth/2.0/token',
        method: 'post',
        params: {
          grant_type: 'client_credentials',
          ...pick(secret, ['client_id', 'client_secret']),
        }
      });
      await this.setAccessToken(appKey, access_token);
    }

    return this.accessToken[appKey];
  }

  async fetchOCR(params: OCRParameter): Promise<OCRResult> {
    const appKey = BaiduApp.OCR;
    if (!this.accessToken[appKey]) {
      await this.getAccessToken(appKey);
    }
    // simple diff
    if (isEqual(this.prevState.OCRParams, params)) {
      this.logger.info('repeat image, skip');
      return this.prevState.OCRResult as OCRResult;
    }
    const resData: BaiduOCRResponseData = await callApi({
      domain: this.domain,
      api: '/rest/2.0/ocr/v1/general_basic',
      method: 'post',
      params: {
        access_token: this.accessToken[appKey],
      },
      data: {
        detect_direction: false,
        paragraph: false,
        probability: false,
        ...params
      } as BaiduOCRParameter,
    });
    if (resData.error_msg) {
      if ([
        BaiduStatusCode.AccessTokenInvalid,
        BaiduStatusCode.AccessTokenExpired,
      ].includes(resData.error_code!)) {
        this.setAccessToken(appKey, '');
      }
      throw new Error(resData.error_msg);
    }
    const { words_result } = resData;
    const result: OCRResult = words_result.map(x => x.words);

    this.prevState = {
      ...this.prevState,
      OCRParams: params,
      OCRResult: result,
    };
    return result;
  }

  async fetchTranslator(params: TranslatorParameter) {
    const appKey = BaiduApp.Translator;
    if (!this.accessToken[appKey]) {
      await this.getAccessToken(appKey);
    }
    // simple diff
    if (isEqual(this.prevState.translatorParams, params)) {
      this.logger.info('repeat params, skip');
      return this.prevState.translatorResult as TranslatorResult;
    }
    const resData: BaiduTranslatorResponseData = await callApi({
      domain: this.domain,
      headers: {
        ['Content-Type']: 'application/json'
      },
      api: '/rpc/2.0/mt/texttrans/v1',
      method: 'post',
      params: {
        access_token: this.accessToken[appKey],
      },
      data: {
        from: params.from || BaiduTranslatorLanguage.Auto,
        to: params.to || BaiduTranslatorLanguage.Chinese,
        q: params.strings.join(' '),
      } as BaiduTranslatorParameter
    });
    if (resData.error_msg) {
      if ([
        BaiduStatusCode.AccessTokenInvalid,
        BaiduStatusCode.AccessTokenExpired,
      ].includes(resData.error_code!)) {
        this.setAccessToken(appKey, '');
      }
      throw new Error(resData.error_msg);
    }
    const { result: { trans_result } } = resData;
    const result: TranslatorResult = trans_result.map(x => x.dst);
    this.prevState = {
      ...this.prevState,
      translatorParams: params,
      translatorResult: result,
    };
    return result;
  }
}
