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
  captureCost: number
  ocrCost: number
  translatorCost: number
  looperCost: number
  result: TranslatorResult
}

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
}

type LooperParameter = {
  timeout: number
  onSuccess?: (arg0: ServiceStartResult & {
    looperCost: number
  }) => unknown
  onError?: (error: string) => unknown
};
