export enum FontSize {
  Large = '5vw',
  Normal = '3.6vw',
}

export const DEFAULT_TEXT = [
  { text: 'Welcome to  OCR Translator.', fontSize: FontSize.Large },
  { text: '1. click [capture screen] icon', fontSize: FontSize.Normal },
  { text: '2. select region', fontSize: FontSize.Normal },
  { text: '3. click [start]', fontSize: FontSize.Normal },
];

export const DEFAULT_TIPS: ITips = { type: 'info', message: '' };

export enum LooperStatus {
  Stop = 'Stop',
  Loading = 'Loading',
  Running = 'Running',
}
