export enum FontSize {
  Large = '24px',
  Normal = '20px',
}

export const DEFAULT_STYLE = { fontSize: FontSize.Normal };

export const DEFAULT_TEXT = [
  {
    text: '欢迎使用 OCR Translator', style: {
      fontSize: FontSize.Large
    }
  },
  { text: '1. 点击 [捕获画面]', style: DEFAULT_STYLE },
  { text: '2. 选择区域', style: DEFAULT_STYLE },
  { text: '3. 点击 [开始]', style: DEFAULT_STYLE },
];

export const DEFAULT_TIPS: ITips = { type: 'info', message: '' };

export enum LooperStatus {
  Stop = 'Stop',
  Loading = 'Loading',
  Running = 'Running',
}
