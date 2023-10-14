// ACCESS_TOKEN
interface BaiduAccessTokenResponseData {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  session_key: string
  session_secret: string
}


// OCR
interface BaiduOCRSecret {
  client_id?: string
  client_secret?: string
  access_token?: string
}

interface BaiduOCRParameter {
  image: string
  detect_direction?: boolean
  paragraph?: boolean
  probability?: boolean
}

type BaiduOCRResultItem = {
  words: string
}

interface BaiduOCRResponseData {
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
interface BaiduTranslatorParameter {
  q: string
  from?: string
  to?: string
}

type BaiduTransResultItem = {
  src: string
  dst: string
}

interface BaiduTranslatorResponseData {
  log_id: string
  result: {
    from: string
    to: string
    trans_result: BaiduTransResultItem[]
  }
  error_msg?: string
  error_code?: number
}
