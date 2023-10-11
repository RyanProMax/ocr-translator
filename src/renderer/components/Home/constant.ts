export const DEFAULT_TEXT = [
  { text: 'Welcome to  OCR Translator.', fontSize: 20 },
  { text: '1. click [capture screen] icon', fontSize: 16 },
  { text: '2. select region', fontSize: 16 },
  { text: '3. click [start]', fontSize: 16 },
];

export const DEFAULT_TIPS: ITips = { type: 'info', message: '' };

export enum LooperStatus {
  Stop = 'Stop',
  Loading = 'Loading',
  Running = 'Running',
}
