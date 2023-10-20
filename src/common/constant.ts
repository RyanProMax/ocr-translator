export enum Pages {
  Home = 'home.html',
  CropScreen = 'cropScreen.html',
  Capture = 'captureScreen.html',
  Settings = 'settings.html',
}

export enum Channels {
  Quit = 'Quit',

  // main event
  Drag = 'Drag',
  Resize = 'Resize',
  GetPackageJson = 'GetPackageJson',
  OpenExternal = 'OpenExternal',
  Broadcast = 'Broadcast',

  // capture screen event
  CropScreenShow = 'CropScreenShow',
  CropScreenHide = 'CropScreenHide',
  CropScreenConfirm = 'CropScreenConfirm',
  HideCaptureWindow = 'HideCaptureWindow',
  UpdateCropArea = 'UpdateCropArea',

  // OCR
  GetScreenSource = 'GetScreenSource',

  // store
  GetUserStore = 'GetUserStore',
  SetUserStore = 'SetUserStore',

  // setting
  OpenSettings = 'OpenSettings',
  CloseSettings = 'CloseSettings',
  UpdateSettings = 'UpdateSettings',
}
