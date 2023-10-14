/************** Unified data structure **************/
type base64 = string;

interface PrevState {
  OCRParams?: OCRParameter,
  OCRResult?: OCRResult
  translatorParams?: TranslatorParameter
  translatorResult?: TranslatorResult
}

type OCRParameter = {
  image: base64
};
type OCRResult = string[];

type TranslatorParameter = {
  from?: string
  to?: string
  strings: string[]
};

type TranslatorResult = string[];

type ServiceStartResult = {
  ocrCost: number,
  translatorCost: number,
  result: TranslatorResult
}

type LooperParameter = {
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
