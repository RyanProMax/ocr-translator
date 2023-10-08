export const createTransparentImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
};

export const ipcRenderer = window.__ELECTRON__.ipcRenderer;
