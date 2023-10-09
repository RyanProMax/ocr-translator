export enum Pages {
  Home = 'home.html',
  CropScreen = 'cropScreen.html',
  Capture = 'captureScreen.html',
}

export enum Channels {
  Quit = 'Quit',

  // main event
  Drag = 'Drag',
  Resize = 'Resize',

  // capture screen event
  CropScreenShow = 'CropScreenShow',
  CropScreenHide = 'CropScreenHide',
  CropScreenConfirm = 'CropScreenConfirm',
  UpdateCropArea = 'UpdateCropArea',

  // OCR
  GetScreenSource = 'GetScreenSource',

  // store
  GetUserStore = 'GetUserStore',
  SetUserStore = 'SetUserStore',

  // setting
  OpenSetting = 'OpenSetting',
  CloseSetting = 'CloseSetting',
}
