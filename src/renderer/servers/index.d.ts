/************** Baidu **************/
// ACCESS_TOKEN
declare interface BaiduAccessTokenResponseData {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  session_key: string
  session_secret: string
}


// OCR
declare interface BaiduOCRSecret {
  client_id?: string
  client_secret?: string
  access_token?: string
}

declare interface BaiduOCRParameter {
  image: string
  detect_direction?: boolean
  paragraph?: boolean
  probability?: boolean
}

declare type BaiduOCRResultItem = {
  words: string
}

declare interface BaiduOCRResponseData {
  direction: number
  log_id: string
  words_result_num: number
  words_result: BaiduOCRResultItem[]
  paragraphs_result?: unknown
  language?: number
  error_msg?: string
  error_code?: number
}

// Translator
declare interface BaiduTranslatorParameter {
  q: string
  from?: string
  to?: string
}

declare type BaiduTransResultItem = {
  src: string
  dst: string
}

declare interface BaiduTranslatorResponseData {
  log_id: string
  result: {
    from: string
    to: string
    trans_result: BaiduTransResultItem[]
  }
  error_msg?: string
  error_code?: number
}

/************** Unified data structure **************/
type base64 = string;

declare type OCRParameter = {
  image: base64
};
declare type OCRResult = string[];

declare type TranslatorParameter = {
  from?: string
  to?: string
  strings: string[]
};

declare type TranslatorResult = string[];

declare type ServiceStartResult = {
  ocrCost: number,
  translatorCost: number,
  result: TranslatorResult
}

declare type LooperParameter = {
  video: HTMLVideoElement,
  timeout: number
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  onSuccess?: (arg0: ServiceStartResult & {
    captureCost: number
    looperCost: number
  }) => unknown
  onError?: (error: string) => unknown
};
