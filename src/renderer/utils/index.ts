export const createTransparentImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
};
