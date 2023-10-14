export enum FontSize {
  Large = '32px',
  Normal = '24px',
}

export const DEFAULT_STYLE = { fontSize: FontSize.Normal };

export const DEFAULT_TEXT = [
  { text: 'Welcome to  OCR Translator.', style: DEFAULT_STYLE },
  { text: '1. click [capture screen]', style: DEFAULT_STYLE },
  { text: '2. select region', style: DEFAULT_STYLE },
  { text: '3. click [start]', style: DEFAULT_STYLE },
];

export const DEFAULT_TIPS: ITips = { type: 'info', message: '' };

export enum LooperStatus {
  Stop = 'Stop',
  Loading = 'Loading',
  Running = 'Running',
}
