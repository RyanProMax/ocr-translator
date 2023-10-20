import { Rectangle } from 'electron/renderer';
import axios, { AxiosRequestConfig } from 'axios';

import { Channels } from 'src/common/constant';

export const createTransparentImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  ctx!.clearRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
};

export const ipcRenderer = window.__ELECTRON__.ipcRenderer;

export const loadStream = async (sourceId: string): Promise<HTMLVideoElement> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
      }
    }
  } as any);
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      resolve(video);
    };
  });
};

export const captureVideo = ({
  video, imageType = 'image/png', bounds
}: {
  video: HTMLVideoElement
  imageType?: string
  bounds?: Rectangle
}) => {
  const { videoWidth, videoHeight } = video;
  const videoCanvas = document.createElement('canvas');
  const ctx = videoCanvas.getContext('2d') as CanvasRenderingContext2D;
  videoCanvas.width = videoWidth;
  videoCanvas.height = videoHeight;
  ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

  if (bounds) {
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d') as CanvasRenderingContext2D;
    outputCanvas.width = bounds.width;
    outputCanvas.height = bounds.height;
    const imageData = ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
    outputCtx.putImageData(imageData, 0, 0);
    return {
      base64: outputCanvas.toDataURL(imageType),
    };
  }

  return {
    base64: videoCanvas.toDataURL(imageType),
  };
};


export const callApi = async ({
  domain, api, needRaw = false, headers, ...config
}: AxiosRequestConfig & {
  domain?: string
  api?: string
  needRaw?: boolean
}) => {
  const result = await axios({
    headers: {
      Accept: 'application/json',
      ['Content-Type']: config.method?.toLowerCase() === 'post'
        ? 'application/x-www-form-urlencoded'
        : 'application/json',
      ...headers,
    },
    url: `${domain}${api}`,
    method: 'get',
    ...config,
  });
  return needRaw ? result : result.data;
};

export const getUserStore = <T>(key: T) => {
  return ipcRenderer.invoke(Channels.GetUserStore, key);
};

export const setUserStore = <T, U>(key: T, value: U) => {
  return ipcRenderer.invoke(Channels.SetUserStore, key, value);
};
