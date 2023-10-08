import { useEffect, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { Channels } from 'src/common/constant';
import { createTransparentImage, ipcRenderer } from 'src/renderer/utils';

import 'cropperjs/dist/cropper.css';
import './index.less';

const transparentImgUrl = createTransparentImage();

export default () => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleCancel = () => {
    ipcRenderer.send(Channels.CropScreenHide);
  };

  const onCropEnd = () => {
    const data = cropperRef.current?.cropper.getData();
    if (data) {
      ipcRenderer.send(Channels.CropScreenConfirm, data);
    }
    cropperRef.current!.cropper.clear();
    ipcRenderer.send(Channels.CropScreenHide);
  };

  useEffect(() => {
    const updateCropArea = (_: Electron.IpcRendererEvent, data: any) => {
      console.log('updateCropArea', data);
      if (data) {
        return cropperRef.current?.cropper.setData(data);
      }
    };

    ipcRenderer.on(Channels.UpdateCropArea, updateCropArea);

    return () => {
      ipcRenderer.removeListener(Channels.UpdateCropArea, updateCropArea);
    };
  }, []);

  return (
    <div
      onContextMenu={handleCancel}
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
