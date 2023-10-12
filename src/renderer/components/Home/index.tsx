import { useEffect, useState } from 'react';
import { round, throttle } from 'lodash-es';
import classnames from 'classnames';
import log from 'electron-log/renderer';

import { ipcRenderer, loadStream } from 'src/renderer/utils';
import { server } from 'src/renderer/servers/Server';
import { Channels } from 'src/common/constant';
import useDrag from 'src/renderer/hooks/useDrag';
import useBounds from 'src/renderer/hooks/useBounds';

import ControlBar, { Icon } from './ControlBar';
import Tips from './Tips';
import { DEFAULT_TEXT, DEFAULT_TIPS, FontSize, LooperStatus } from './constant';

import './index.less';

const homeLogger = log.scope('home');

export default () => {
  const { cursorEnter, mouseEvent } = useDrag();
  const [content, setContent] = useState(DEFAULT_TEXT);
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [isResize, setIsResize] = useState(false);
  const [start, setStart] = useState(false);
  const [looperStatus, setLooperStatus] = useState(LooperStatus.Stop);
  const showControlBar = cursorEnter || isResize;
  const boundsRef = useBounds();

  const onClickIcon = async (type: Icon) => {
    homeLogger.info('onClickIcon', type);
    switch (type) {
      case Icon.ScreenCapture: {
        return ipcRenderer.send(Channels.CropScreenShow);
      }
      case Icon.TriggerStart: {
        if (!start) {
          if (looperStatus === LooperStatus.Loading) {
            return;
          }
          setLooperStatus(LooperStatus.Loading);
          const result = await ipcRenderer.invoke(Channels.GetScreenSource);
          homeLogger.info('invoke GetScreenSource', result);
          const { errorMessage, data } = result;
          if (errorMessage) {
            setTips({ type: 'error', message: `Error: ${errorMessage}` });
            setLooperStatus(LooperStatus.Stop);
          } else {
            const { id, bounds } = data;
            boundsRef.current = bounds;
            server.startLooper({
              video: await loadStream(id),
              timeout: 200,
              bounds: boundsRef.current,
              onSuccess: ({
                result, captureCost, looperCost, ocrCost, translatorCost
              }) => {
                setContent(result.map(text => ({
                  text,
                  fontSize: FontSize.Normal
                })));
                setTips({
                  type: 'info',
                  message: `cost ${round(looperCost / 1000, 2)}s` +
                    `(capture: ${captureCost}ms,` +
                    (ocrCost > 0 ? ` OCR: ${ocrCost}ms,` : ' OCR: skip') +
                    (translatorCost > 0 ? ` translator: ${translatorCost}ms)` : ' translator: skip')
                });
              },
              onError: error => {
                setTips({
                  type: 'error',
                  message: `Error: ${error}`,
                });
              }
            });
            setStart(true);
            setLooperStatus(LooperStatus.Running);
          }
        } else {
          // stop
          server.stopLooper();
          setContent(DEFAULT_TEXT);
          setTips(DEFAULT_TIPS);
          setStart(false);
          setLooperStatus(LooperStatus.Stop);
        }
        return;
      }
      case Icon.Close: {
        return ipcRenderer.send(Channels.Quit);
      }
      case Icon.Settings: {
        return ipcRenderer.send(Channels.OpenSettings);
      }
      default: return;
    }
  };

  useEffect(() => {
    const handleResize = throttle((_: Electron.IpcRendererEvent, _isResize: boolean) => {
      // console.log('handleResize', handleResize);
      setIsResize(_isResize);
    }, 50);

    ipcRenderer.on(Channels.Resize, handleResize);

    return () => {
      ipcRenderer.removeListener(Channels.Resize, handleResize);
    };
  }, []);

  return (
    <div {...mouseEvent} className={classnames('home', {
      'home--show-control-bar': showControlBar
    })}>
      <ControlBar
        show={showControlBar}
        looperStatus={looperStatus}
        onClickIcon={onClickIcon}
      />
      <div className='home-content'>
        {content.map(({ text, fontSize }, idx) => (
          <span key={idx} className='home-content__item' style={{ fontSize }}>
            {text}
          </span>
        ))}
      </div>
      <Tips type={tips.type} message={tips.message} />
    </div>
  );
};
