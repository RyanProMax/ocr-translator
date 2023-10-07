import { useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { Channels } from 'src/common/constant';
import { createTransparentImage } from 'src/renderer/utils';

import 'cropperjs/dist/cropper.css';
import './index.less';

const transparentImgUrl = createTransparentImage();

export default () => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleConfirm = () => {
    return window.__ELECTRON__.ipcRenderer.send(Channels.CropScreenCancel);
  };

  const onCropEnd = () => {
    const data = cropperRef.current!.cropper.getData();
    window.__ELECTRON__.ipcRenderer.send(Channels.CropScreenConfirm, data);
  };

  return (
    <div
      onContextMenu={handleConfirm}
      className='crop-screen'
    >
      <Cropper
        ref={cropperRef}
        src={transparentImgUrl}
        autoCrop={false}
        background={false}
        guides={false}
        style={{ width: '100vw', height: '100vh' }}
        className='crop-screen__cropper'
        cropend={onCropEnd}
      />
    </div >
  );
};
